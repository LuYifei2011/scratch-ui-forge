/**
 * Scratch script templates for button components.
 *
 * Generated scripts:
 *   1. 🟢 Green flag → switch to default costume
 *   2. 🟢 Green flag → forever loop:
 *        if touching mouse-pointer then
 *          if mouse down then
 *            switch to pressed costume
 *            broadcast "{spriteName}-点击"
 *            wait until not mouse down
 *          else
 *            switch to hover costume
 *        else
 *          switch to default costume
 *
 * Adapts to whichever costume variants are actually present.
 */

import type { ScratchBlock, ScratchSpriteScript } from "../types";
import { emptySpriteScript } from "../types";
import {
  uid,
  createBlock,
  costumeShadow,
  buildScript,
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
  const hoverCostume =
    costumeNames.find((n) => n.includes("hover")) ?? defaultCostume;
  const pressedCostume =
    costumeNames.find((n) => n.includes("pressed")) ?? defaultCostume;

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

  // ── Script 2: green flag → forever loop with mouse detection ──────
  {
    const hatId = uid();
    type Entry = [string, ScratchBlock];
    const extras: Entry[] = [];

    // ─ Inner-most "if mouse down" branch: pressed costume + broadcast + wait until not mouse down ─
    // switch to pressed
    const switchPressedId = uid();
    const [shPressedId, shPressed] = costumeShadow(pressedCostume);
    const switchPressed = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shPressedId] },
    });
    extras.push([shPressedId, shPressed]);

    // broadcast
    const broadcastBlockId = uid();
    const broadcastBlock = createBlock({
      opcode: "event_broadcast",
      inputs: {
        BROADCAST_INPUT: [1, [11, broadcastName, broadcastId]],
      },
    });
    switchPressed.next = broadcastBlockId;
    broadcastBlock.parent = switchPressedId;

    // wait until NOT mouse down
    const waitUntilId = uid();
    const notId = uid();
    const mouseDownId = uid();

    const mouseDown = createBlock({
      opcode: "sensing_mousedown",
    });
    const notBlock = createBlock({
      opcode: "operator_not",
      inputs: { OPERAND: [2, mouseDownId] },
    });
    mouseDown.parent = notId;

    const waitUntil = createBlock({
      opcode: "control_wait_until",
      inputs: { CONDITION: [2, notId] },
    });
    broadcastBlock.next = waitUntilId;
    waitUntil.parent = broadcastBlockId;

    extras.push([mouseDownId, mouseDown]);
    extras.push([notId, notBlock]);
    extras.push([waitUntilId, waitUntil]);

    // ─ "else" of inner if (mouse not down → hover): switch to hover ─
    const switchHoverId = uid();
    const [shHoverId, shHover] = costumeShadow(hoverCostume);
    const switchHover = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shHoverId] },
    });
    extras.push([shHoverId, shHover]);

    // ─ Inner if-else: mouse down? ─
    const mouseDown2Id = uid();
    const mouseDown2 = createBlock({
      opcode: "sensing_mousedown",
    });

    const innerIfElseId = uid();
    const innerIfElse = createBlock({
      opcode: "control_if_else",
      inputs: {
        CONDITION: [2, mouseDown2Id],
        SUBSTACK: [2, switchPressedId],
        SUBSTACK2: [2, switchHoverId],
      },
    });
    mouseDown2.parent = innerIfElseId;
    switchPressed.parent = innerIfElseId;
    switchHover.parent = innerIfElseId;

    extras.push([mouseDown2Id, mouseDown2]);

    // ─ "else" of outer if (not touching → default): switch to default ─
    const switchDefaultId = uid();
    const [shDefaultId, shDefault] = costumeShadow(defaultCostume);
    const switchDefault = createBlock({
      opcode: "looks_switchcostumeto",
      inputs: { COSTUME: [1, shDefaultId] },
    });
    extras.push([shDefaultId, shDefault]);

    // ─ Outer if-else: touching mouse-pointer? ─
    const touchingId = uid();
    const [touchingMenuId, touchingMenu] = (() => {
      const id = uid();
      return [id, createBlock({
        opcode: "sensing_touchingobjectmenu",
        shadow: true,
        fields: { TOUCHINGOBJECTMENU: ["_mouse_", null] },
      })];
    })();
    const touching = createBlock({
      opcode: "sensing_touchingobject",
      inputs: { TOUCHINGOBJECTMENU: [1, touchingMenuId] },
    });
    extras.push([touchingMenuId, touchingMenu]);

    const outerIfElseId = uid();
    const outerIfElse = createBlock({
      opcode: "control_if_else",
      inputs: {
        CONDITION: [2, touchingId],
        SUBSTACK: [2, innerIfElseId],
        SUBSTACK2: [2, switchDefaultId],
      },
    });
    touching.parent = outerIfElseId;
    innerIfElse.parent = outerIfElseId;
    switchDefault.parent = outerIfElseId;

    extras.push([touchingId, touching]);

    // ─ Forever loop wrapping the outer if-else ─
    const foreverId = uid();
    const forever = createBlock({
      opcode: "control_forever",
      inputs: {
        SUBSTACK: [2, outerIfElseId],
      },
    });
    outerIfElse.parent = foreverId;

    const built = buildScript(
      [hatId, createBlock({ opcode: "event_whenflagclicked" })],
      [[foreverId, forever]],
      [
        [outerIfElseId, outerIfElse],
        [innerIfElseId, innerIfElse],
        [switchPressedId, switchPressed],
        [broadcastBlockId, broadcastBlock],
        [switchHoverId, switchHover],
        [switchDefaultId, switchDefault],
        ...extras,
      ],
    );
    Object.assign(script.blocks, built.blocks);
    script.blocks[hatId].x = 0;
    script.blocks[hatId].y = 250;
  }

  return script;
}
