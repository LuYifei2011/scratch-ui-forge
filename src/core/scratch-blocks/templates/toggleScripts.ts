/**
 * Scratch script templates for toggle / switch components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [开关状态] to 0 → switch to first costume
 *   2. 🖱️ When clicked →
 *        if [开关状态] = 0 then
 *          set to 1
 *          (if anim frames → repeat N { next costume, wait })
 *          (else → switch to "开启" costume)
 *        else
 *          set to 0
 *          (if anim frames → repeat N { switch to previous costume, wait })
 *          (else → switch to "关闭" costume)
 */

import type { ScratchBlock, ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
  stringLiteral,
  numberLiteral,
} from "../BlockBuilder";

export interface ToggleScriptOptions {
  costumeNames: string[];
}

export function generateToggleScripts(
  opts: ToggleScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;

  // Detect animation mode: if costumes are numbered sequentially (开关-0, 开关-1, ...)
  const isAnimMode = costumeNames.length > 2 && costumeNames.some((n) => /开关-\d+/.test(n));
  const animFrameCount = isAnimMode ? costumeNames.length - 1 : 0;

  const offCostume = costumeNames[0];
  const onCostume = costumeNames[costumeNames.length - 1];

  // Variable: 开关状态
  const varId = uid();
  const varName = "开关状态";
  script.variables[varId] = [varName, 0];

  // ── Script 1: green flag → init ───────────────────────────────────
  {
    const hatId = uid();
    const setVarId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(offCostume);

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenflagclicked" })],
      [
        [
          setVarId,
          createBlock({
            opcode: "data_setvariableto",
            inputs: { VALUE: stringLiteral("0") },
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

  // ── Script 2: when clicked → toggle ───────────────────────────────
  {
    const hatId = uid();
    type Entry = [string, ScratchBlock];
    const extras: Entry[] = [];

    // -- Build "if" branch: turn ON (开关状态 == 0)
    const setToOneId = uid();
    const setToOne = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("1") },
      fields: { VARIABLE: [varName, varId] },
    });

    if (isAnimMode && animFrameCount > 0) {
      // repeat (animFrameCount) { next costume; wait 0.03 }
      const nextCostumeId = uid();
      const nextCostume = createBlock({ opcode: "looks_nextcostume" });

      const waitAnimId = uid();
      const waitAnim = createBlock({
        opcode: "control_wait",
        inputs: { DURATION: numberLiteral(0.03) },
      });
      nextCostume.next = waitAnimId;
      waitAnim.parent = nextCostumeId;

      const repeatId = uid();
      const repeat = createBlock({
        opcode: "control_repeat",
        inputs: {
          TIMES: numberLiteral(animFrameCount),
          SUBSTACK: [2, nextCostumeId],
        },
      });
      nextCostume.parent = repeatId;

      setToOne.next = repeatId;
      repeat.parent = setToOneId;

      extras.push([nextCostumeId, nextCostume]);
      extras.push([waitAnimId, waitAnim]);
      extras.push([repeatId, repeat]);
    } else {
      // No animation: switch directly to ON costume
      const switchOnId = uid();
      const [shOnId, shOn] = costumeShadow(onCostume);
      const switchOn = createBlock({
        opcode: "looks_switchcostumeto",
        inputs: { COSTUME: [1, shOnId] },
      });
      extras.push([shOnId, shOn]);

      setToOne.next = switchOnId;
      switchOn.parent = setToOneId;

      extras.push([switchOnId, switchOn]);
    }

    // -- Build "else" branch: turn OFF (开关状态 == 1)
    const setToZeroId = uid();
    const setToZero = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("0") },
      fields: { VARIABLE: [varName, varId] },
    });

    if (isAnimMode && animFrameCount > 0) {
      // repeat (animFrameCount) { previous costume (looks_nextcostume isn't it... 
      //   Scratch doesn't have a "previous costume" block directly, 
      //   but we can use: switch costume to ((costume number) - 1)
      // Actually Scratch has no "previous costume" block. We compute: costume # - 1

      // costume number reporter
      const costumeNumId = uid();
      const costumeNum = createBlock({
        opcode: "looks_costumenumbername",
        fields: { NUMBER_NAME: ["number", null] },
      });

      // (costume number) - 1
      const subtractId = uid();
      const subtract = createBlock({
        opcode: "operator_subtract",
        inputs: {
          NUM1: [3, costumeNumId, [4, ""]],
          NUM2: [1, [4, "1"]],
        },
      });
      costumeNum.parent = subtractId;

      // switch costume to (subtract result)
      const switchPrevId = uid();
      const switchPrev = createBlock({
        opcode: "looks_switchcostumeto",
        inputs: { COSTUME: [3, subtractId, [10, ""]] },
      });
      subtract.parent = switchPrevId;

      // wait
      const waitRevId = uid();
      const waitRev = createBlock({
        opcode: "control_wait",
        inputs: { DURATION: numberLiteral(0.03) },
      });
      switchPrev.next = waitRevId;
      waitRev.parent = switchPrevId;

      // repeat block
      const repeatRevId = uid();
      const repeatRev = createBlock({
        opcode: "control_repeat",
        inputs: {
          TIMES: numberLiteral(animFrameCount),
          SUBSTACK: [2, switchPrevId],
        },
      });
      switchPrev.parent = repeatRevId;

      setToZero.next = repeatRevId;
      repeatRev.parent = setToZeroId;

      extras.push([costumeNumId, costumeNum]);
      extras.push([subtractId, subtract]);
      extras.push([switchPrevId, switchPrev]);
      extras.push([waitRevId, waitRev]);
      extras.push([repeatRevId, repeatRev]);
    } else {
      // No animation: switch directly to OFF costume
      const switchOffId = uid();
      const [shOffId, shOff] = costumeShadow(offCostume);
      const switchOff = createBlock({
        opcode: "looks_switchcostumeto",
        inputs: { COSTUME: [1, shOffId] },
      });
      extras.push([shOffId, shOff]);

      setToZero.next = switchOffId;
      switchOff.parent = setToZeroId;

      extras.push([switchOffId, switchOff]);
    }

    // -- condition: 开关状态 = 0
    const equalsId = uid();
    const varReadId = uid();
    const varRead: ScratchBlock = createBlock({
      opcode: "data_variable",
      fields: { VARIABLE: [varName, varId] },
    });
    const equals = createBlock({
      opcode: "operator_equals",
      inputs: {
        OPERAND1: [3, varReadId, [10, ""]],
        OPERAND2: [1, [10, "0"]],
      },
    });
    varRead.parent = equalsId;

    // -- if-else block
    const ifElseId = uid();
    const ifElse = createBlock({
      opcode: "control_if_else",
      inputs: {
        CONDITION: [2, equalsId],
        SUBSTACK: [2, setToOneId],
        SUBSTACK2: [2, setToZeroId],
      },
    });
    equals.parent = ifElseId;
    setToOne.parent = ifElseId;
    setToZero.parent = ifElseId;

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenthisspriteclicked" })],
      [[ifElseId, ifElse]],
      [
        [equalsId, equals],
        [varReadId, varRead],
        [setToOneId, setToOne],
        [setToZeroId, setToZero],
        ...extras,
      ],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 300;
  }

  return script;
}
