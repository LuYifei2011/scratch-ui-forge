/**
 * Scratch script templates for radio button components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [已选中] to 0 → switch to unselected costume
 *   2. 🖱️ When clicked →
 *        if [已选中] = 0 then set 1, switch to selected
 *        else set 0, switch to unselected
 */

import type { ScratchBlock, ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
  stringLiteral,
} from "../BlockBuilder";

export interface RadioScriptOptions {
  costumeNames: string[];
}

export function generateRadioScripts(
  opts: RadioScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;

  const unselectedCostume =
    costumeNames.find((n) => n.includes("未选中")) ?? costumeNames[0];
  const selectedCostume =
    costumeNames.find((n) => n.includes("已选中")) ?? costumeNames[costumeNames.length - 1];

  // Variable: 已选中
  const varId = uid();
  const varName = "已选中";
  script.variables[varId] = [varName, 0];

  // ── Script 1: green flag → init ───────────────────────────────────
  {
    const hatId = uid();
    const setVarId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(unselectedCostume);

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

    // -- "if" branch: set 已选中 to 1, switch to selected costume
    const setToOneId = uid();
    const switchSelectedId = uid();
    const [shSelectedId, shSelected] = costumeShadow(selectedCostume);
    extras.push([shSelectedId, shSelected]);

    const setToOne = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("1") },
      fields: { VARIABLE: [varName, varId] },
    });
    setToOne.next = switchSelectedId;

    const switchSelected = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shSelectedId] },
    });
    switchSelected.parent = setToOneId;

    // -- "else" branch: set 已选中 to 0, switch to unselected costume
    const setToZeroId = uid();
    const switchUnselectedId = uid();
    const [shUnselectedId, shUnselected] = costumeShadow(unselectedCostume);
    extras.push([shUnselectedId, shUnselected]);

    const setToZero = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("0") },
      fields: { VARIABLE: [varName, varId] },
    });
    setToZero.next = switchUnselectedId;

    const switchUnselected = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shUnselectedId] },
    });
    switchUnselected.parent = setToZeroId;

    // -- condition: 已选中 = 0
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

    // Set parents for inner blocks
    setToOne.parent = ifElseId;
    switchSelected.parent = setToOneId;
    setToZero.parent = ifElseId;
    switchUnselected.parent = setToZeroId;
    equals.parent = ifElseId;
    varRead.parent = equalsId;

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenthisspriteclicked" })],
      [[ifElseId, ifElse]],
      [
        [equalsId, equals],
        [varReadId, varRead],
        [setToOneId, setToOne],
        [switchSelectedId, switchSelected],
        [setToZeroId, setToZero],
        [switchUnselectedId, switchUnselected],
        ...extras,
      ],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 300;
  }

  return script;
}
