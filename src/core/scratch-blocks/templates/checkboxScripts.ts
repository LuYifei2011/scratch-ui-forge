/**
 * Scratch script templates for checkbox components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → set [已勾选] to 0 → switch to unchecked costume
 *   2. 🖱️ When clicked →
 *        if [已勾选] = 0 then set 1, switch to checked
 *        else set 0, switch to unchecked
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

export interface CheckboxScriptOptions {
  costumeNames: string[];
}

export function generateCheckboxScripts(
  opts: CheckboxScriptOptions,
): ScratchSpriteScript {
  const script = emptySpriteScript();
  const { costumeNames } = opts;

  const uncheckedCostume =
    costumeNames.find((n) => n.includes("未勾选")) ?? costumeNames[0];
  const checkedCostume =
    costumeNames.find((n) => n.includes("已勾选")) ?? costumeNames[costumeNames.length - 1];

  // Variable: 已勾选
  const varId = uid();
  const varName = "已勾选";
  script.variables[varId] = [varName, 0];

  // ── Script 1: green flag → init ───────────────────────────────────
  {
    const hatId = uid();
    const setVarId = uid();
    const switchId = uid();
    const [shadowId, shadow] = costumeShadow(uncheckedCostume);

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

    // Build the if-else block with its sub-stacks

    // -- "if" branch: set 已勾选 to 1, switch to checked costume
    const setToOneId = uid();
    const switchCheckedId = uid();
    const [shCheckedId, shChecked] = costumeShadow(checkedCostume);
    extras.push([shCheckedId, shChecked]);

    const setToOne = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("1") },
      fields: { VARIABLE: [varName, varId] },
    });
    setToOne.next = switchCheckedId;

    const switchChecked = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shCheckedId] },
    });
    switchChecked.parent = setToOneId;

    // -- "else" branch: set 已勾选 to 0, switch to unchecked costume
    const setToZeroId = uid();
    const switchUncheckedId = uid();
    const [shUncheckedId, shUnchecked] = costumeShadow(uncheckedCostume);
    extras.push([shUncheckedId, shUnchecked]);

    const setToZero = createBlock({
      opcode: "data_setvariableto",
      inputs: { VALUE: stringLiteral("0") },
      fields: { VARIABLE: [varName, varId] },
    });
    setToZero.next = switchUncheckedId;

    const switchUnchecked = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shUncheckedId] },
    });
    switchUnchecked.parent = setToZeroId;

    // -- condition: 已勾选 = 0
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
    switchChecked.parent = setToOneId; // already set but be explicit
    setToZero.parent = ifElseId;
    switchUnchecked.parent = setToZeroId;
    equals.parent = ifElseId;
    varRead.parent = equalsId;

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenthisspriteclicked" })],
      [[ifElseId, ifElse]],
      [
        [equalsId, equals],
        [varReadId, varRead],
        [setToOneId, setToOne],
        [switchCheckedId, switchChecked],
        [setToZeroId, setToZero],
        [switchUncheckedId, switchUnchecked],
        ...extras,
      ],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 300;
  }

  return script;
}
