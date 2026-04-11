/**
 * Scratch script templates for button components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → switch to default costume
 *   2. 🖱️ When this sprite clicked → broadcast "{spriteName}-点击",
 *      switch to pressed costume, wait 0.1s, switch back to default
 *
 * Adapts to whichever costume variants are actually present.
 */

import type { ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
  numberLiteral,
} from "../BlockBuilder";

export interface ButtonScriptOptions {
  spriteName: string;
  costumeNames: string[];
}

export function generateButtonScripts(
  opts: ButtonScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { spriteName, costumeNames } = opts;

  const defaultCostume =
    costumeNames.find((n) => n.includes("default")) ?? costumeNames[0];
  const pressedCostume = costumeNames.find((n) => n.includes("pressed"));

  // Broadcast
  const broadcastId = uid();
  const broadcastName = `${spriteName}-点击`;
  script.broadcasts[broadcastId] = broadcastName;

  // ── Script 1: green flag → switch to default costume ──────────────
  {
    const hatId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(defaultCostume);

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenflagclicked" })],
      [
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

  // ── Script 2: when clicked → broadcast + pressed feedback ─────────
  {
    const hatId = uid();
    type Entry = [string, ReturnType<typeof createBlock>];
    const stack: Entry[] = [];
    const extras: Entry[] = [];

    // broadcast message
    stack.push([
      uid(),
      createBlock({
        opcode: "event_broadcast",
        inputs: {
          BROADCAST_INPUT: [1, [11, broadcastName, broadcastId]],
        },
      }),
    ]);

    // If pressed costume exists → switch to it, wait, switch back
    if (pressedCostume && pressedCostume !== defaultCostume) {
      const [shPressedId, shPressed] = costumeShadow(pressedCostume);
      stack.push([
        uid(),
        createBlock({
          opcode: "looks_switchcostumeto",
          inputs: { COSTUME: [1, shPressedId] },
        }),
      ]);
      extras.push([shPressedId, shPressed]);

      stack.push([
        uid(),
        createBlock({
          opcode: "control_wait",
          inputs: { DURATION: numberLiteral(0.1) },
        }),
      ]);

      const [shBackId, shBack] = costumeShadow(defaultCostume);
      stack.push([
        uid(),
        createBlock({
          opcode: "looks_switchcostumeto",
          inputs: { COSTUME: [1, shBackId] },
        }),
      ]);
      extras.push([shBackId, shBack]);
    }

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenthisspriteclicked" })],
      stack,
      extras,
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 250;
  }

  return script;
}
