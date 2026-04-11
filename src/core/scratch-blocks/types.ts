/**
 * Type definitions for Scratch 3.0 block JSON format.
 *
 * Reference: https://en.scratch-wiki.info/wiki/Scratch_File_Format
 */

// ─── Scratch Block Primitives ────────────────────────────────────────

/** A single Scratch block in the serialised format. */
export interface ScratchBlock {
  opcode: string;
  next: string | null;
  parent: string | null;
  inputs: Record<string, ScratchInput>;
  fields: Record<string, ScratchField>;
  shadow: boolean;
  topLevel: boolean;
  x?: number;
  y?: number;
  mutation?: Record<string, string>;
}

/**
 * Scratch input tuple.
 *
 * Common forms:
 *   [1, shadowId]          – shadow block only
 *   [1, [literalType, value]]  – literal value
 *   [3, blockId, shadowId] – block obscuring shadow
 */
export type ScratchInput = [number, ...unknown[]];

/**
 * Scratch field tuple.  `[value]` or `[value, id]`.
 */
export type ScratchField = [string, string | null];

// ─── Sprite-level script output ──────────────────────────────────────

/** Everything that goes into the sprite manifest beyond costumes/sounds. */
export interface ScratchSpriteScript {
  blocks: Record<string, ScratchBlock>;
  variables: Record<string, [string, string | number]>;
  lists: Record<string, [string, unknown[]]>;
  broadcasts: Record<string, string>;
}

/** Merge-friendly empty script set. */
export function emptySpriteScript(): ScratchSpriteScript {
  return { blocks: {}, variables: {}, lists: {}, broadcasts: {} };
}

/** Merge two script sets together (mutates `target`). */
export function mergeSpriteScripts(
  target: ScratchSpriteScript,
  source: ScratchSpriteScript,
): ScratchSpriteScript {
  Object.assign(target.blocks, source.blocks);
  Object.assign(target.variables, source.variables);
  Object.assign(target.lists, source.lists);
  Object.assign(target.broadcasts, source.broadcasts);
  return target;
}
