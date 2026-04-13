import type { Container } from "@svgdotjs/svg.js";
import type { Corners } from "@/core/types";
import { drawRect } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface TextInputBaseOptions {
  /** Background fill color */
  fill: string;
  /** Border color */
  borderColor: string;
  /** Text color */
  textColor: string;
  /** Placeholder color */
  placeholderColor: string;
  /** Font family */
  fontFamily: string;
}

export interface TextInputStyleOptions {
  /** Input width. Default: 200 */
  width?: number;
  /** Input height. Default: 36 */
  height?: number;
  /** Placeholder text. Default: "请输入…" */
  placeholder?: string;
  /** Actual input value (overrides placeholder display). Default: "" */
  value?: string;
  /** Font size. Default: 14 */
  fontSize?: number;
  /** Border width. Default: 1.5 */
  borderWidth?: number;
  /** Border radius. Default: 4 */
  borderRadius?: number;
  /** Whether the input appears focused. Default: false */
  focused?: boolean;
  /** Focus border color. Default: uses borderColor */
  focusBorderColor?: string;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type TextInputOptions = TextInputBaseOptions & TextInputStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  width: 200,
  height: 36,
  placeholder: "请输入…",
  value: "",
  fontSize: 14,
  borderWidth: 1.5,
  borderRadius: 4,
  focused: false,
  focusBorderColor: "",
  opacity: 1,
};

// ─── Render ──────────────────────────────────────────────────────────

export function renderTextInput(draw: Container, opts: TextInputOptions): void {
  const o = { ...DEFAULTS, ...opts };
  const paddingX = 10;

  const bColor = o.focused && o.focusBorderColor ? o.focusBorderColor : o.borderColor;
  const bWidth = o.focused ? o.borderWidth + 0.5 : o.borderWidth;

  const corners: Corners<number> = {
    topLeft: o.borderRadius,
    topRight: o.borderRadius,
    bottomRight: o.borderRadius,
    bottomLeft: o.borderRadius,
  };

  // Box
  drawRect(draw, {
    width: o.width,
    height: o.height,
    fill: o.fill,
    border: {
      width: bWidth,
      color: bColor,
      radius: corners,
    },
    opacity: o.opacity,
  });

  // Text content
  const displayText = o.value || o.placeholder;
  const textFill = o.value ? o.textColor : o.placeholderColor;

  drawText(draw, {
    text: displayText,
    x: paddingX,
    y: o.height / 2,
    fontSize: o.fontSize,
    fontFamily: o.fontFamily,
    fill: textFill,
    anchor: "start",
    verticalAlign: "middle",
  });

  // Cursor line when focused
  if (o.focused && o.value) {
    const cursorX = paddingX + measureTextApprox(o.value, o.fontSize) + 2;
    const cursorTop = o.height * 0.25;
    const cursorBottom = o.height * 0.75;
    draw
      .line(cursorX, cursorTop, cursorX, cursorBottom)
      .stroke({ color: o.textColor, width: 1.5 });
  }

  if (o.extraAttrs) {
    for (const [k, v] of Object.entries(o.extraAttrs)) {
      draw.attr(k, v);
    }
  }
}

/** Rough text width approximation when Canvas isn't needed for layout. */
function measureTextApprox(text: string, fontSize: number): number {
  return text.length * fontSize * 0.55;
}
