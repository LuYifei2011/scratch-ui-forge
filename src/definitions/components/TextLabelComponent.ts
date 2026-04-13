import type { Container } from "@svgdotjs/svg.js";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface TextLabelBaseOptions {
  /** Text color */
  textColor: string;
  /** Font family */
  fontFamily: string;
}

export interface TextLabelStyleOptions {
  /** Text content. Default: "文本" */
  text?: string;
  /** Font size. Default: 14 */
  fontSize?: number;
  /** Font weight. Default: "normal" */
  fontWeight?: string;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type TextLabelOptions = TextLabelBaseOptions & TextLabelStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  text: "文本",
  fontSize: 14,
  fontWeight: "normal",
  opacity: 1,
};

// ─── Render ──────────────────────────────────────────────────────────

export function renderTextLabel(draw: Container, opts: TextLabelOptions): void {
  const o = { ...DEFAULTS, ...opts };

  drawText(draw, {
    text: o.text,
    x: 0,
    y: 0,
    fontSize: o.fontSize,
    fontFamily: o.fontFamily,
    fill: o.textColor,
    fontWeight: o.fontWeight,
    anchor: "start",
    verticalAlign: "top",
  });

  if (o.opacity < 1) {
    draw.opacity(o.opacity);
  }

  if (o.extraAttrs) {
    for (const [k, v] of Object.entries(o.extraAttrs)) {
      draw.attr(k, v);
    }
  }
}
