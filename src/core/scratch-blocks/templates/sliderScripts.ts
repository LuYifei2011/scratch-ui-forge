/**
 * Scratch script templates for slider components.
 *
 * Slider interaction in Scratch is complex (mouse tracking),
 * so for now we provide a simplified / empty script.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → switch to first costume
 */

import type { ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
} from "../BlockBuilder";

export interface SliderScriptOptions {
  costumeNames: string[];
}

export function generateSliderScripts(
  opts: SliderScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;
  if (costumeNames.length === 0) return script;

  const firstCostume = costumeNames[0];

  // ── Script 1: green flag → switch to first costume ────────────────
  const hatId = uid();
  const switchId = uid();
  const [shadowId, shadow] = costumeShadow(firstCostume);

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

  return script;
}
