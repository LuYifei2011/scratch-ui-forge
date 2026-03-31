import type { Container } from "@svgdotjs/svg.js";
import { drawCapsule, drawCircle } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface ToggleBaseOptions {
  /** Track color (resolved for on/off state by the caller) */
  trackColor: string;
  /** Knob fill color */
  knobColor: string;
  /** Font family */
  fontFamily: string;
}

export interface ToggleStyleOptions {
  /** Whether the toggle is in "on" state. Default: false */
  on?: boolean;
  /**
   * Animation progress 0–1. Default: derived from `on` (0 or 1).
   * Allows rendering intermediate positions for animation frames.
   */
  progress?: number;
  /** Easing function string (informational, for export metadata). */
  easing?: string;
  /** Track width. Default: 44 */
  trackWidth?: number;
  /** Track height. Default: 22 */
  trackHeight?: number;
  /** Text label to the right of the toggle. Default: "" */
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

export type ToggleOptions = ToggleBaseOptions & ToggleStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  on: false,
  trackWidth: 44,
  trackHeight: 22,
  label: "",
  labelFontSize: 14,
  labelColor: "#242424",
  opacity: 1,
};

const LABEL_GAP = 8;

// ─── Render ──────────────────────────────────────────────────────────

export function renderToggle(draw: Container, opts: ToggleOptions): void {
  const o = { ...DEFAULTS, ...opts };

  const totalHeight = o.label
    ? Math.ceil(Math.max(o.trackHeight, o.labelFontSize * 1.4))
    : o.trackHeight;

  // Animation progress: 0 = off position, 1 = on position
  const progress = o.progress ?? (o.on ? 1 : 0);

  const trackY = (totalHeight - o.trackHeight) / 2;
  const knobRadius = (o.trackHeight - 4) / 2;
  const knobMinX = knobRadius + 3;
  const knobMaxX = o.trackWidth - knobRadius - 3;
  const knobCx = knobMinX + (knobMaxX - knobMinX) * progress;
  const knobCy = totalHeight / 2;

  // Track
  drawCapsule(draw, {
    x: 0,
    y: trackY,
    width: o.trackWidth,
    height: o.trackHeight,
    fill: o.trackColor,
  });

  // Knob
  drawCircle(draw, {
    cx: knobCx,
    cy: knobCy,
    radius: knobRadius,
    fill: o.knobColor,
  });

  // Label
  if (o.label) {
    drawText(draw, {
      text: o.label,
      x: o.trackWidth + LABEL_GAP,
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
