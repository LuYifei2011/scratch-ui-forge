import type { Container, Text as SvgText } from "@svgdotjs/svg.js";

// Cached canvas for text measurement
let _measureCanvas: HTMLCanvasElement | null = null;

/**
 * Measure text width precisely using Canvas 2D API.
 */
export function measureText(
  text: string,
  fontSize: number,
  fontFamily = "Helvetica, Arial, sans-serif",
  fontWeight = "normal"
): number {
  if (!_measureCanvas) {
    _measureCanvas = document.createElement("canvas");
  }
  const ctx = _measureCanvas.getContext("2d")!;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
}

export interface TextOptions {
  text: string;
  x?: number;
  y?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  verticalAlign?: "top" | "middle" | "bottom";
  maxWidth?: number;
  fontWeight?: string;
}

/**
 * Render text onto an SVG container with alignment.
 * Uses raw SVG attributes for precise positioning.
 */
export function drawText(draw: Container, opts: TextOptions): SvgText {
  const {
    text,
    x = 0,
    y = 0,
    fontSize = 14,
    fontFamily = "Helvetica, Arial, sans-serif",
    fill = "#000",
    anchor = "start",
    verticalAlign = "top",
    fontWeight = "normal",
  } = opts;

  const baselineMap = {
    top: "hanging",
    middle: "central",
    bottom: "alphabetic",
  } as const;

  const t = draw
    .text(text)
    .font({
      size: fontSize,
      family: fontFamily,
      anchor,
      weight: fontWeight,
    })
    .fill(fill)
    .attr("x", x)
    .attr("y", y)
    .attr("dominant-baseline", baselineMap[verticalAlign]);

  return t;
}

/**
 * Draw centered text within a bounding box.
 */
export function drawCenteredText(
  draw: Container,
  text: string,
  cx: number,
  cy: number,
  opts: Omit<TextOptions, "text" | "x" | "y" | "anchor" | "verticalAlign"> = {}
): SvgText {
  return drawText(draw, {
    ...opts,
    text,
    x: cx,
    y: cy,
    anchor: "middle",
    verticalAlign: "middle",
  });
}
