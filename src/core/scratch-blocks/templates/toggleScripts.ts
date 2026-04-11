/**
 * Scratch script templates for toggle / switch components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [开关状态] to 0 → switch to "关闭" costume
 *   2. 🖱️ When clicked →
 *        if [开关状态] = 0 then
 *          set to 1
 *          (if anim frames exist → repeat costume animation)
 *          switch to "开启" costume
 *        else
 *          set to 0
 *          switch to "关闭" costume
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

  const offCostume =
    costumeNames.find((n) => n.includes("关闭")) ?? costumeNames[0];
  const onCostume =
    costumeNames.find((n) => n.includes("开启")) ??
    costumeNames[Math.min(1, costumeNames.length - 1)];
  const hasAnimFrames = costumeNames.some((n) => n.includes("动画"));
  const animFrameCount = costumeNames.filter((n) => n.includes("动画")).length;

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
    type Entry = [string, ReturnType<typeof createBlock>];
    const extras: Entry[] = [];

    // -- "if" branch: turn ON
    // set 开关状态 to 1
    const setToOneId = uid();
    const setToOne = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("1") },
      fields: { VARIABLE: [varName, varId] },
    });

    // Build the "if" sub-stack chain
    const ifFirstBlockId = setToOneId;
    let ifLastBlockId = setToOneId;

    // If animation frames exist, add: repeat (N) { next costume, wait 0.03s }
    if (hasAnimFrames && animFrameCount > 0) {
      // next costume
      const nextCostumeId = uid();
      const nextCostume = createBlock({ opcode: "looks_nextcostume" });

      // wait 0.03
      const waitAnimId = uid();
      const waitAnim = createBlock({
        opcode: "control_wait",
        inputs: { DURATION: numberLiteral(0.03) },
      });
      nextCostume.next = waitAnimId;
      waitAnim.parent = nextCostumeId;

      // repeat block
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
      ifLastBlockId = repeatId;

      extras.push([nextCostumeId, nextCostume]);
      extras.push([waitAnimId, waitAnim]);
      extras.push([repeatId, repeat]);
    }

    // switch to ON costume
    const switchOnId = uid();
    const [shOnId, shOn] = costumeShadow(onCostume);
    const switchOn = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shOnId] },
    });
    extras.push([shOnId, shOn]);

    // link last block → switchOn
    const ifLastBlock = ifLastBlockId === setToOneId ? setToOne :
      extras.find(([id]) => id === ifLastBlockId)?.[1];
    if (ifLastBlock) {
      ifLastBlock.next = switchOnId;
    }
    switchOn.parent = ifLastBlockId;

    // -- "else" branch: turn OFF
    const setToZeroId = uid();
    const setToZero = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("0") },
      fields: { VARIABLE: [varName, varId] },
    });

    const switchOffId = uid();
    const [shOffId, shOff] = costumeShadow(offCostume);
    const switchOff = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shOffId] },
    });
    extras.push([shOffId, shOff]);

    setToZero.next = switchOffId;
    switchOff.parent = setToZeroId;

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
    equals.parent = uid(); // will be overwritten below
    varRead.parent = equalsId;

    // -- if-else block
    const ifElseId = uid();
    const ifElse = createBlock({
      opcode: "control_if_else",
      inputs: {
        CONDITION: [2, equalsId],
        SUBSTACK: [2, ifFirstBlockId],
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
        [switchOnId, switchOn],
        [setToZeroId, setToZero],
        [switchOffId, switchOff],
        ...extras,
      ],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 300;
  }

  return script;
}
