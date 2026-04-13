import type { Container } from "@svgdotjs/svg.js";
import { drawCircle } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface RadioBaseOptions {
  /** Outer ring color when selected */
  radioColor: string;
  /** Inner dot color when selected */
  dotColor: string;
  /** Ring border color when unselected */
  borderColor: string;
  /** Font family */
  fontFamily: string;
}

export interface RadioStyleOptions {
  /** Whether the radio is selected. Default: false */
  selected?: boolean;
  /** Unselected background fill. Default: "#F5F5F5" */
  unselectedFill?: string;
  /** Radio circle diameter. Default: 20 */
  size?: number;
  /** Text label beside the radio. Default: "" */
  label?: string;
  /** Label font size. Default: 14 */
  labelFontSize?: number;
  /** Label text color. Default: "#242424" */
  labelColor?: string;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type RadioOptions = RadioBaseOptions & RadioStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  selected: false,
  unselectedFill: "#F5F5F5",
  size: 20,
  label: "",
  labelFontSize: 14,
  labelColor: "#242424",
  opacity: 1,
};

const LABEL_GAP = 8;

// ─── Render ──────────────────────────────────────────────────────────

export function renderRadio(draw: Container, opts: RadioOptions): void {
  const o = { ...DEFAULTS, ...opts };
  const size = o.size;
  const r = size / 2;

  const totalHeight = o.label
    ? Math.ceil(Math.max(size, o.labelFontSize * 1.4))
    : size;

  const cy = totalHeight / 2;
  const cx = r + 1;

  // Outer ring
  const bgFill = o.selected ? o.radioColor : o.unselectedFill;
  const strokeColor = o.selected ? o.radioColor : o.borderColor;

  drawCircle(draw, {
    cx,
    cy,
    radius: r - 1,
    fill: bgFill,
    stroke: strokeColor,
    strokeWidth: 2,
  });

  // Inner dot when selected
  if (o.selected) {
    drawCircle(draw, {
      cx,
      cy,
      radius: r * 0.4,
      fill: o.dotColor,
    });
  }

  // Label
  if (o.label) {
    drawText(draw, {
      text: o.label,
      x: size + LABEL_GAP,
      y: totalHeight / 2,
      fontSize: o.labelFontSize,
      fontFamily: o.fontFamily,
      fill: o.labelColor,
      anchor: "start",
      verticalAlign: "middle",
    });
  }

  if (o.opacity < 1) {
    draw.opacity(o.opacity);
  }

  if (o.extraAttrs) {
    for (const [k, v] of Object.entries(o.extraAttrs)) {
      draw.attr(k, v);
    }
  }
}
