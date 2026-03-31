import type { Container } from "@svgdotjs/svg.js";
import { drawCapsule, drawCircle } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Slider Track Options ────────────────────────────────────────────

export interface SliderTrackBaseOptions {
  /** Track background color */
  trackColor: string;
  /** Filled portion color */
  fillColor: string;
  /** Font family */
  fontFamily: string;
}

export interface SliderTrackStyleOptions {
  /** Progress value 0–100. Default: 50 */
  value?: number;
  /** Track width. Default: 200 */
  trackWidth?: number;
  /** Track height. Default: 6 */
  trackHeight?: number;
  /** Text label above the track. Default: "" */
  label?: string;
  /** Label font size. Default: 14 */
  labelFontSize?: number;
  /** Label text color. Default: "#E0E0E0" */
  labelColor?: string;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type SliderTrackOptions = SliderTrackBaseOptions & SliderTrackStyleOptions;

// ─── Slider Knob Options ─────────────────────────────────────────────

export interface SliderKnobBaseOptions {
  /** Knob fill color */
  knobColor: string;
  /** Knob stroke/ring color */
  strokeColor: string;
}

export interface SliderKnobStyleOptions {
  /** Knob diameter. Default: 20 */
  knobSize?: number;
  /** Stroke width. Default: 2 */
  strokeWidth?: number;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type SliderKnobOptions = SliderKnobBaseOptions & SliderKnobStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const TRACK_DEFAULTS = {
  value: 50,
  trackWidth: 200,
  trackHeight: 6,
  label: "",
  labelFontSize: 14,
  labelColor: "#E0E0E0",
  opacity: 1,
};

const KNOB_DEFAULTS = {
  knobSize: 20,
  strokeWidth: 2,
  opacity: 1,
};

const LABEL_GAP = 6;

// ─── Render: Slider Track ────────────────────────────────────────────

export function renderSliderTrack(draw: Container, opts: SliderTrackOptions): void {
  const o = { ...TRACK_DEFAULTS, ...opts };

  const trackWidth = o.trackWidth;
  const trackHeight = o.trackHeight;
  const label = o.label;
  const labelArea = label ? Math.ceil(o.labelFontSize * 1.3 + LABEL_GAP) : 0;
  const totalHeight = labelArea + trackHeight;

  let trackY = (totalHeight - trackHeight) / 2;

  // Label
  if (label) {
    drawText(draw, {
      text: label,
      x: 0,
      y: 0,
      fontSize: o.labelFontSize,
      fontFamily: o.fontFamily,
      fill: o.labelColor,
      anchor: "start",
      verticalAlign: "top",
    });
    trackY = totalHeight - trackHeight;
  }

  // Track background
  drawCapsule(draw, {
    x: 0,
    y: trackY,
    width: trackWidth,
    height: trackHeight,
    fill: o.trackColor,
  });

  // Fill
  const fillWidth = (trackWidth * o.value) / 100;
  if (fillWidth > 0) {
    drawCapsule(draw, {
      x: 0,
      y: trackY,
      width: Math.max(fillWidth, trackHeight),
      height: trackHeight,
      fill: o.fillColor,
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

// ─── Render: Slider Knob ─────────────────────────────────────────────

export function renderSliderKnob(draw: Container, opts: SliderKnobOptions): void {
  const o = { ...KNOB_DEFAULTS, ...opts };
  const size = o.knobSize;

  drawCircle(draw, {
    cx: size / 2,
    cy: size / 2,
    radius: size / 2 - 1,
    fill: o.knobColor,
    stroke: o.strokeColor,
    strokeWidth: o.strokeWidth,
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
