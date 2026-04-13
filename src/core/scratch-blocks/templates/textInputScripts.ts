/**
 * Scratch script templates for text input components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [输入内容] to "" → switch to default costume
 *   2. 🖱️ When clicked → ask and wait → set [输入内容] to answer
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

export interface TextInputScriptOptions {
  costumeNames: string[];
}

export function generateTextInputScripts(
  opts: TextInputScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;

  const defaultCostume = costumeNames[0];

  // Variable: 输入内容
  const varId = uid();
  const varName = "输入内容";
  script.variables[varId] = [varName, ""];

  // ── Script 1: green flag → init ───────────────────────────────────
  {
    const hatId = uid();
    const setVarId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(defaultCostume);

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenflagclicked" })],
      [
        [
          setVarId,
          createBlock({
            opcode: "data_setvariableto",
            inputs: { VALUE: stringLiteral("") },
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

  // ── Script 2: when clicked → ask and store answer ─────────────────
  {
    const hatId = uid();

    const askId = uid();
    const ask = createBlock({
      opcode: "sensing_askandwait",
      inputs: { QUESTION: stringLiteral("请输入:") },
    });

    // sensing_answer reporter
    const answerId = uid();
    const answer = createBlock({ opcode: "sensing_answer" });

    const setVarId = uid();
    const setVar = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: [3, answerId, [10, ""]] },
      fields: { VARIABLE: [varName, varId] },
    });
    answer.parent = setVarId;

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenthisspriteclicked" })],
      [
        [askId, ask],
        [setVarId, setVar],
      ],
      [[answerId, answer]],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 300;
  }

  return script;
}
