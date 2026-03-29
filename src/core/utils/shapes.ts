import type { Container, Rect, Circle, Ellipse, Path } from "@svgdotjs/svg.js";
import type { Sides, Corners } from "@/core/types";
import { normalizeSides, normalizeCorners } from "@/core/types";

// ─── Rect (with per-corner radius & per-side border) ─────────────────

export interface DrawRectOptions {
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill?: string;
  border?: {
    width: number | Sides<number>;
    color: string | Sides<string>;
    radius: number | Corners<number>;
  };
  opacity?: number;
}

/**
 * Build an SVG path string for a rectangle with per-corner radii.
 * All corners are clamped so they don't exceed half the rectangle dimension.
 */
function rectPath(x: number, y: number, w: number, h: number, r: Corners<number>): string {
  const maxR = Math.min(w / 2, h / 2);
  const tl = Math.min(r.topLeft, maxR);
  const tr = Math.min(r.topRight, maxR);
  const br = Math.min(r.bottomRight, maxR);
  const bl = Math.min(r.bottomLeft, maxR);
  return [
    `M${x + tl},${y}`,
    `L${x + w - tr},${y}`,
    tr > 0 ? `A${tr},${tr},0,0,1,${x + w},${y + tr}` : "",
    `L${x + w},${y + h - br}`,
    br > 0 ? `A${br},${br},0,0,1,${x + w - br},${y + h}` : "",
    `L${x + bl},${y + h}`,
    bl > 0 ? `A${bl},${bl},0,0,1,${x},${y + h - bl}` : "",
    `L${x},${y + tl}`,
    tl > 0 ? `A${tl},${tl},0,0,1,${x + tl},${y}` : "",
    "Z",
  ]
    .filter(Boolean)
    .join(" ");
}

function sidesEqual<T>(s: Sides<T>): boolean {
  return s.top === s.right && s.right === s.bottom && s.bottom === s.left;
}

function cornersEqual<T>(c: Corners<T>): boolean {
  return c.topLeft === c.topRight && c.topRight === c.bottomRight && c.bottomRight === c.bottomLeft;
}

/**
 * Draw a rectangle with per-corner radius and per-side border.
 *
 * - If all corners are equal, uses `<rect>` for simplicity.
 * - If corners differ, uses a `<path>` with arc commands.
 * - If border sides differ, draws individual border line segments.
 */
export function drawRect(draw: Container, opts: DrawRectOptions) {
  const { x = 0, y = 0, width, height, fill = "#ccc", border, opacity = 1 } = opts;

  const bw = border ? normalizeSides(border.width) : normalizeSides(0);
  const bc = border ? normalizeSides(border.color) : normalizeSides("none" as string);
  const br = border ? normalizeCorners(border.radius) : normalizeCorners(0);

  // Inset fill area by border widths
  const fx = x + bw.left / 2;
  const fy = y + bw.top / 2;
  const fw = width - (bw.left + bw.right) / 2;
  const fh = height - (bw.top + bw.bottom) / 2;

  const uniformCorners = cornersEqual(br);
  const uniformBorder = sidesEqual(bw) && sidesEqual(bc);

  let shape: Rect | Path;

  if (uniformCorners) {
    // Simple <rect>
    shape = draw.rect(fw, fh).move(fx, fy).radius(br.topLeft).fill(fill);

    if (uniformBorder && bw.top > 0 && bc.top !== "none") {
      shape.stroke({ color: bc.top, width: bw.top });
    }
  } else {
    // Complex path with varying corners
    shape = draw.path(rectPath(fx, fy, fw, fh, br)).fill(fill);

    if (uniformBorder && bw.top > 0 && bc.top !== "none") {
      shape.stroke({ color: bc.top, width: bw.top });
    }
  }

  shape.opacity(opacity);

  // Per-side borders when sides differ
  if (!uniformBorder) {
    if (bw.top > 0 && bc.top !== "none") {
      draw
        .line(x + br.topLeft, y + bw.top / 2, x + width - br.topRight, y + bw.top / 2)
        .stroke({ color: bc.top, width: bw.top, linecap: "round" });
    }
    if (bw.right > 0 && bc.right !== "none") {
      draw
        .line(x + width - bw.right / 2, y + br.topRight, x + width - bw.right / 2, y + height - br.bottomRight)
        .stroke({ color: bc.right, width: bw.right, linecap: "round" });
    }
    if (bw.bottom > 0 && bc.bottom !== "none") {
      draw
        .line(x + br.bottomLeft, y + height - bw.bottom / 2, x + width - br.bottomRight, y + height - bw.bottom / 2)
        .stroke({ color: bc.bottom, width: bw.bottom, linecap: "round" });
    }
    if (bw.left > 0 && bc.left !== "none") {
      draw
        .line(x + bw.left / 2, y + br.topLeft, x + bw.left / 2, y + height - br.bottomLeft)
        .stroke({ color: bc.left, width: bw.left, linecap: "round" });
    }
  }

  return shape;
}

export interface RoundedRectOptions {
  x?: number;
  y?: number;
  width: number;
  height: number;
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Draw a rounded rectangle.
 */
export function drawRoundedRect(draw: Container, opts: RoundedRectOptions): Rect {
  const {
    x = 0,
    y = 0,
    width,
    height,
    radius = 4,
    fill = "#ccc",
    stroke = "none",
    strokeWidth = 0,
    opacity = 1,
  } = opts;

  return draw
    .rect(width, height)
    .move(x, y)
    .radius(radius)
    .fill(fill)
    .stroke({ color: stroke, width: strokeWidth })
    .opacity(opacity);
}

export interface CapsuleOptions {
  x?: number;
  y?: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Draw a capsule shape (fully rounded ends).
 */
export function drawCapsule(draw: Container, opts: CapsuleOptions): Rect {
  const { x = 0, y = 0, width, height, fill = "#ccc", stroke = "none", strokeWidth = 0 } = opts;
  return draw
    .rect(width, height)
    .move(x, y)
    .radius(height / 2)
    .fill(fill)
    .stroke({ color: stroke, width: strokeWidth });
}

export interface CircleOptions {
  cx: number;
  cy: number;
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Draw a circle.
 */
export function drawCircle(draw: Container, opts: CircleOptions): Circle {
  const { cx, cy, radius, fill = "#ccc", stroke = "none", strokeWidth = 0 } = opts;
  return draw
    .circle(radius * 2)
    .center(cx, cy)
    .fill(fill)
    .stroke({ color: stroke, width: strokeWidth });
}

export interface EllipseOptions {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill?: string;
}

export function drawEllipse(draw: Container, opts: EllipseOptions): Ellipse {
  const { cx, cy, rx, ry, fill = "#ccc" } = opts;
  return draw
    .ellipse(rx * 2, ry * 2)
    .center(cx, cy)
    .fill(fill);
}

/**
 * Draw an SVG path from a path string.
 */
export function drawPath(draw: Container, d: string, fill = "#000", stroke = "none", strokeWidth = 0): Path {
  return draw.path(d).fill(fill).stroke({ color: stroke, width: strokeWidth });
}
