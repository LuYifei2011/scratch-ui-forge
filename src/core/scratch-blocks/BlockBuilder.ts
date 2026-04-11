/**
 * Fluent helpers for constructing Scratch 3.0 block JSON structures.
 *
 * IDs are generated as short random strings via nanoid.
 */

import { nanoid } from "nanoid";
import type { ScratchBlock, ScratchInput, ScratchField } from "./types";

// ─── ID generation ───────────────────────────────────────────────────

/** Generate a unique block / variable / broadcast ID. */
export function uid(): string {
  return nanoid(20);
}

// ─── Block creation helpers ──────────────────────────────────────────

export interface BlockOptions {
  opcode: string;
  inputs?: Record<string, ScratchInput>;
  fields?: Record<string, ScratchField>;
  shadow?: boolean;
  topLevel?: boolean;
  x?: number;
  y?: number;
  mutation?: Record<string, string>;
}

/** Create a standalone block (parent/next set to null). */
export function createBlock(opts: BlockOptions): ScratchBlock {
  return {
    opcode: opts.opcode,
    next: null,
    parent: null,
    inputs: opts.inputs ?? {},
    fields: opts.fields ?? {},
    shadow: opts.shadow ?? false,
    topLevel: opts.topLevel ?? false,
    x: opts.x,
    y: opts.y,
    ...(opts.mutation ? { mutation: opts.mutation } : {}),
  };
}

// ─── Literal input helpers ───────────────────────────────────────────

/**
 * Wrap a numeric literal as a Scratch input value.
 * Literal type 4 = number, 5 = positive number, 6 = positive integer,
 * 7 = integer, 8 = angle, 9 = color, 10 = string.
 */
export function numberLiteral(value: number): [number, [number, string]] {
  return [1, [4, String(value)]];
}

export function stringLiteral(value: string): [number, [number, string]] {
  return [1, [10, value]];
}

export function positiveIntLiteral(value: number): [number, [number, string]] {
  return [1, [6, String(value)]];
}

// ─── Shadow costume / backdrop menu ──────────────────────────────────

/**
 * Create a costume menu shadow block (looks_costume).
 * Returns [blockId, block] pair.
 */
export function costumeShadow(costumeName: string): [string, ScratchBlock] {
  const id = uid();
  return [
    id,
    createBlock({
      opcode: "looks_costume",
      shadow: true,
      fields: { COSTUME: [costumeName, null] },
    }),
  ];
}

// ─── Chain helper ────────────────────────────────────────────────────

/**
 * Chain an ordered list of `[id, block]` pairs into a linear stack.
 * Sets `next` / `parent` pointers and makes the first block `topLevel`.
 * Returns the entries as a flat Record for merging into `blocks`.
 */
export function chain(
  entries: [string, ScratchBlock][],
): Record<string, ScratchBlock> {
  const result: Record<string, ScratchBlock> = {};
  for (let i = 0; i < entries.length; i++) {
    const [id, block] = entries[i];
    if (i === 0) {
      block.topLevel = true;
      block.x = 0;
      block.y = 0;
    }
    if (i > 0) {
      block.parent = entries[i - 1][0];
    }
    if (i < entries.length - 1) {
      block.next = entries[i + 1][0];
    }
    result[id] = block;
  }
  return result;
}

/**
 * Attach parent pointers for blocks referenced as inputs inside `hostId`.
 * Call after chain() with any extra shadow / reporter blocks.
 */
export function linkInputs(
  blocks: Record<string, ScratchBlock>,
  hostId: string,
): void {
  const host = blocks[hostId];
  if (!host) return;
  for (const input of Object.values(host.inputs)) {
    // input[1] may be a block ID string or a literal array
    if (typeof input[1] === "string" && blocks[input[1]]) {
      blocks[input[1]].parent = hostId;
    }
    // input[2] is an optional shadow ID
    if (input.length > 2 && typeof input[2] === "string" && blocks[input[2]]) {
      blocks[input[2]].parent = hostId;
    }
  }
  // Also handle substack inputs (SUBSTACK, SUBSTACK2) for control blocks
  for (const key of ["SUBSTACK", "SUBSTACK2"]) {
    const sub = host.inputs[key];
    if (sub && typeof sub[1] === "string" && blocks[sub[1]]) {
      blocks[sub[1]].parent = hostId;
    }
  }
}

// ─── Script builder (hat + stack) ────────────────────────────────────

export interface ScriptResult {
  /** All blocks in this script (including shadows). */
  blocks: Record<string, ScratchBlock>;
  /** The ID of the hat (top-level) block. */
  hatId: string;
}

/**
 * Build a complete script: hat block followed by stack blocks.
 * Extra "loose" blocks (shadows, reporters) can be provided separately
 * and will be linked to their parent via `linkInputs`.
 */
export function buildScript(
  hat: [string, ScratchBlock],
  stack: [string, ScratchBlock][],
  extras?: [string, ScratchBlock][],
): ScriptResult {
  const chained = chain([hat, ...stack]);
  if (extras) {
    for (const [id, block] of extras) {
      chained[id] = block;
    }
  }
  // Link input references
  for (const id of Object.keys(chained)) {
    linkInputs(chained, id);
  }
  return { blocks: chained, hatId: hat[0] };
}
