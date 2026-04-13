import type { Container } from "@svgdotjs/svg.js";
import { drawCapsule, drawRoundedRect } from "@/core/utils/shapes";
import { drawText } from "@/core/utils/text";

// ─── Options ─────────────────────────────────────────────────────────

export interface ProgressBarBaseOptions {
  /** Track background color */
  trackColor: string;
  /** Fill / progress color */
  fillColor: string;
  /** Font family */
  fontFamily: string;
}

export interface ProgressBarStyleOptions {
  /** Progress value 0–100. Default: 50 */
  value?: number;
  /** Bar width. Default: 200 */
  barWidth?: number;
  /** Bar height. Default: 12 */
  barHeight?: number;
  /** Border radius (0 = square, barHeight/2 = capsule). Default: barHeight/2 */
  borderRadius?: number;
  /** Text label above the bar. Default: "" */
  label?: string;
  /** Label font size. Default: 14 */
  labelFontSize?: number;
  /** Label text color. Default: "#242424" */
  labelColor?: string;
  /** Whether to show percentage text. Default: false */
  showPercent?: boolean;
  /** Percentage text color. Default: "#242424" */
  percentColor?: string;
  /** Opacity. Default: 1 */
  opacity?: number;
  /** Extra SVG attributes */
  extraAttrs?: Record<string, string>;
}

export type ProgressBarOptions = ProgressBarBaseOptions & ProgressBarStyleOptions;

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULTS = {
  value: 50,
  barWidth: 200,
  barHeight: 12,
  borderRadius: -1, // sentinel: means "use capsule"
  label: "",
  labelFontSize: 14,
  labelColor: "#242424",
  showPercent: false,
  percentColor: "#242424",
  opacity: 1,
};

const LABEL_GAP = 6;
const PERCENT_GAP = 8;

// ─── Render ──────────────────────────────────────────────────────────

export function renderProgressBar(draw: Container, opts: ProgressBarOptions): void {
  const o = { ...DEFAULTS, ...opts };
  const barW = o.barWidth;
  const barH = o.barHeight;
  const radius = o.borderRadius < 0 ? barH / 2 : o.borderRadius;
  const isCapsule = radius >= barH / 2;

  const label = o.label;
  const labelArea = label ? Math.ceil(o.labelFontSize * 1.3 + LABEL_GAP) : 0;

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
  }

  const barY = labelArea;

  // Track
  if (isCapsule) {
    drawCapsule(draw, { x: 0, y: barY, width: barW, height: barH, fill: o.trackColor });
  } else {
    drawRoundedRect(draw, { x: 0, y: barY, width: barW, height: barH, radius, fill: o.trackColor });
  }

  // Fill
  const fillW = Math.max(0, (barW * Math.min(100, Math.max(0, o.value))) / 100);
  if (fillW > 0) {
    if (isCapsule) {
      drawCapsule(draw, { x: 0, y: barY, width: Math.max(fillW, barH), height: barH, fill: o.fillColor });
    } else {
      drawRoundedRect(draw, {
        x: 0,
        y: barY,
        width: Math.max(fillW, radius * 2),
        height: barH,
        radius,
        fill: o.fillColor,
      });
    }
  }

  // Percentage text
  if (o.showPercent) {
    drawText(draw, {
      text: `${Math.round(o.value)}%`,
      x: barW + PERCENT_GAP,
      y: barY + barH / 2,
      fontSize: o.labelFontSize,
      fontFamily: o.fontFamily,
      fill: o.percentColor,
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
