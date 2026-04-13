/**
 * Scratch script templates for progress bar components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [进度值] to 50 → switch to first costume
 */

import type { ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
  stringLiteral,
} from "../BlockBuilder";

export interface ProgressBarScriptOptions {
  costumeNames: string[];
}

export function generateProgressBarScripts(
  opts: ProgressBarScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;

  const firstCostume = costumeNames[0];

  // Variable: 进度值
  const varId = uid();
  const varName = "进度值";
  script.variables[varId] = [varName, 50];

  // ── Script 1: green flag → init ───────────────────────────────────
  {
    const hatId = uid();
    const setVarId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(firstCostume);

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenflagclicked" })],
      [
        [
          setVarId,
          createBlock({
            opcode: "data_setvariableto",
            inputs: { VALUE: stringLiteral("50") },
            fields: { VARIABLE: [varName, varId] },
          }),
        ],
        [
          switchId,
          createBlock({
            opcode: "looks_switchcostumeto",
            inputs: { COSTUME: [1, shadowId] },
          }),
        ],
      ],
      [[shadowId, shadow]],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 0;
  }

  return script;
}
