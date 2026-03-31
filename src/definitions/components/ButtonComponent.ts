import type { Container } from "@svgdotjs/svg.js";
import type { Sides, Corners } from "@/core/types";
import { sidesOf, cornersOf } from "@/core/types";
import { drawRect } from "@/core/utils/shapes";
import { drawCenteredText, measureText } from "@/core/utils/text";
import { drawIcon } from "@/core/utils/icons";

// ─── Options ─────────────────────────────────────────────────────────

/** Required options that have no sensible default. */
export interface ButtonBaseOptions {
  /** Background fill color */
  fill: string;
  /** Text / icon color */
  textColor: string;
  /** Font family */
  fontFamily: string;
}

/** All style knobs — every field is optional with a default. */
export interface ButtonStyleOptions {
  /** Button text label. Default: "" */
  label?: string;
  /** Icon name (from built-in registry). Default: "" (no icon) */
  icon?: string;
  /** Icon position. Default: "left" */
  iconPosition?: "left" | "right";
  /** Font size in px. Default: 14 */
  fontSize?: number;
  /** Font weight. Default: "bold" */
  fontWeight?: string;
  /** Explicit width (0 = auto). Default: 0 */
  width?: number;
  /** Explicit height (0 = auto). Default: 0 */
  height?: number;
  /** Border width (uniform or per-side). Default: 0 */
  borderWidth?: number | Sides<number>;
  /** Border color (uniform or per-side). Default: "none" */
  borderColor?: string | Sides<string>;
  /** Border radius (uniform or per-corner). Default: 4 */
  borderRadius?: number | Corners<number>;
  /** Opacity 0–1. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes to attach to the root group */
  extraAttrs?: Record<string, string>;
}

export type ButtonOptions = ButtonBaseOptions & ButtonStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  label: "",
  icon: "",
  iconPosition: "left" as const,
  fontSize: 14,
  fontWeight: "bold",
  width: 0,
  height: 0,
  borderWidth: 0,
  borderColor: "none",
  borderRadius: 4,
  opacity: 1,
};

// ─── Render ──────────────────────────────────────────────────────────

export function renderButton(draw: Container, opts: ButtonOptions): void {
  const o = { ...DEFAULTS, ...opts };

  const iconSize = o.fontSize;
  const hasIcon = !!o.icon;
  const gap = hasIcon && o.label ? 6 : 0;
  const paddingX = Math.max(14, o.fontSize);
  const paddingY = Math.max(8, Math.round(o.fontSize * 0.6));

  const bw = typeof o.borderWidth === "number" ? o.borderWidth : o.borderWidth.top;

  const textWidth = o.label ? measureText(o.label, o.fontSize, o.fontFamily, o.fontWeight) : 0;
  const contentWidth = textWidth + (hasIcon ? iconSize + gap : 0);

  const width = o.width || Math.ceil(contentWidth + paddingX * 2 + bw * 2);
  const height = o.height || Math.ceil(Math.max(o.fontSize, hasIcon ? iconSize : o.fontSize) + paddingY * 2 + bw * 2);

  // Background
  drawRect(draw, {
    width,
    height,
    fill: o.fill,
    border: {
      width: o.borderWidth,
      color: o.borderColor,
      radius: o.borderRadius,
    },
    opacity: o.opacity,
  });

  // Icon + Text layout
  const totalWidth = textWidth + (hasIcon ? iconSize + gap : 0);
  let startX = (width - totalWidth) / 2;

  if (hasIcon && o.iconPosition === "left") {
    drawIcon(draw, o.icon!, startX, (height - iconSize) / 2, iconSize, o.textColor);
    startX += iconSize + gap;
  }

  if (o.label) {
    drawCenteredText(draw, o.label, hasIcon ? startX + textWidth / 2 : width / 2, height / 2, {
      fontSize: o.fontSize,
      fill: o.textColor,
      fontWeight: o.fontWeight,
      fontFamily: o.fontFamily,
    });
  }

  if (hasIcon && o.iconPosition === "right") {
    drawIcon(draw, o.icon!, startX + textWidth + gap, (height - iconSize) / 2, iconSize, o.textColor);
  }

  if (o.extraAttrs) {
    for (const [k, v] of Object.entries(o.extraAttrs)) {
      draw.attr(k, v);
    }
  }
}
