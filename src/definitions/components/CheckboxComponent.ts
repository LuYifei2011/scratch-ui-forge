import type { Container } from "@svgdotjs/svg.js";
import { drawRoundedRect } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface CheckboxBaseOptions {
  /** Box background color when checked */
  checkboxColor: string;
  /** Checkmark color */
  checkColor: string;
  /** Box border/stroke color */
  borderColor: string;
  /** Font family */
  fontFamily: string;
}

export interface CheckboxStyleOptions {
  /** Whether the checkbox is checked. Default: false */
  checked?: boolean;
  /** Box background color when unchecked. Default: "#F5F5F5" */
  uncheckedFill?: string;
  /** Box size in px. Default: 20 */
  size?: number;
  /** Text label beside the box. Default: "" */
  label?: string;
  /** Label font size. Default: 14 */
  labelFontSize?: number;
  /** Label text color. Default: "#242424" */
  labelColor?: string;
  /** Border radius. Default: 4 */
  borderRadius?: number;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type CheckboxOptions = CheckboxBaseOptions & CheckboxStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  checked: false,
  uncheckedFill: "#F5F5F5",
  size: 20,
  label: "",
  labelFontSize: 14,
  labelColor: "#242424",
  borderRadius: 4,
  opacity: 1,
};

const LABEL_GAP = 8;

// ─── Render ──────────────────────────────────────────────────────────

export function renderCheckbox(draw: Container, opts: CheckboxOptions): void {
  const o = { ...DEFAULTS, ...opts };
  const size = o.size;

  const totalHeight = o.label
    ? Math.ceil(Math.max(size, o.labelFontSize * 1.4))
    : size;

  const boxY = (totalHeight - size) / 2;
  const bgFill = o.checked ? o.checkboxColor : o.uncheckedFill;
  const strokeColor = o.checked ? o.checkboxColor : o.borderColor;

  // Checkbox box
  drawRoundedRect(draw, {
    x: 1,
    y: boxY + 1,
    width: size - 2,
    height: size - 2,
    radius: Math.min(o.borderRadius, size / 2),
    fill: bgFill,
    stroke: strokeColor,
    strokeWidth: 2,
    opacity: o.opacity,
  });

  // Checkmark
  if (o.checked) {
    const scale = (size - 4) / 24;
    const offsetX = -2;
    const offsetY = boxY - 2;
    const group = draw.group();
    group
      .path("M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z")
      .fill(o.checkColor)
      .transform({ scaleX: scale, scaleY: scale });
    group.translate(offsetX, offsetY);
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
