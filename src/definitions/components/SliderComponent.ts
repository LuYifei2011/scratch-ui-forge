import type { ScratchComponentDef, RenderContext, ResolvedTheme } from "@/core/types";
import { measureText } from "@/core/utils/text";

const LABEL_GAP = 6;

function computeTrackSize(params: Record<string, unknown>, theme: ResolvedTheme) {
  const trackWidth = (params.trackWidth as number) || 200;
  const trackHeight = (params.trackHeight as number) || 6;
  const label = (params.label as string) || "";
  const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
  const fontFamily = theme.variables.fontFamily;

  const w = label ? Math.max(trackWidth, measureText(label, labelFontSize, fontFamily, "normal")) : trackWidth;
  const h = label ? Math.ceil(labelFontSize * 1.3 + LABEL_GAP + trackHeight) : trackHeight;

  return { width: Math.ceil(w), height: Math.ceil(h) };
}

function computeKnobSize(params: Record<string, unknown>) {
  const knobSize = (params.knobSize as number) || 20;
  return { width: knobSize, height: knobSize };
}

const sliderDef: ScratchComponentDef = {
  id: "slider",
  name: "滑块",
  category: "基础",
  // Top-level render draws the combined preview; parts generate separate exports
  render(ctx: RenderContext) {
    // Combined preview: track + knob together
    const { draw, params, theme, utils } = ctx;
    const state = (params._state as string) ?? "default";
    const value = params.value as number;
    const opacity = state === "disabled" ? theme.variables.disabledOpacity : (params.opacity as number);
    const trackColor = (params.trackColor as string) || theme.variables.borderColor.top;
    const fillColor = (params.fillColor as string) || theme.variables.primaryColor;
    const knobColor = (params.knobColor as string) || theme.variables.backgroundColor;
    const trackWidth = params.trackWidth as number;
    const trackHeight = params.trackHeight as number;
    const knobSize = (params.knobSize as number) || 20;
    const label = (params.label as string) || "";
    const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
    const labelColor = theme.variables.labelColor;
    const fontFamily = theme.variables.fontFamily;
    const labelArea = label ? Math.ceil(labelFontSize * 1.3 + LABEL_GAP) : 0;
    const height = labelArea + Math.max(trackHeight, knobSize);

    let contentY = 0;

    // Label
    if (label) {
      utils.text.drawText(draw, {
        text: label,
        x: 0,
        y: contentY + labelFontSize * 0.15,
        fontSize: labelFontSize,
        fontFamily,
        fill: labelColor,
        anchor: "start",
        verticalAlign: "top",
      });
      contentY += labelFontSize * 1.3 + LABEL_GAP;
    }

    const knobRadius = knobSize / 2;
    const trackY = contentY + (height - contentY - trackHeight) / 2;
    const actualTrackY = Math.max(contentY, trackY);
    const fillWidth = (trackWidth * value) / 100;

    // Track background
    utils.shapes.drawCapsule(draw, {
      x: 0,
      y: actualTrackY,
      width: trackWidth,
      height: trackHeight,
      fill: trackColor,
    });

    // Fill
    if (fillWidth > 0) {
      utils.shapes.drawCapsule(draw, {
        x: 0,
        y: actualTrackY,
        width: Math.max(fillWidth, trackHeight),
        height: trackHeight,
        fill: fillColor,
      });
    }

    // Knob (in combined preview)
    const knobCx = fillWidth;
    const knobCy = actualTrackY + trackHeight / 2;
    utils.shapes.drawCircle(draw, {
      cx: Math.max(knobRadius, Math.min(knobCx, trackWidth - knobRadius)),
      cy: knobCy,
      radius: knobRadius,
      fill: knobColor,
      stroke: fillColor,
      strokeWidth: 2,
    });

    if (opacity < 1) {
      draw.opacity(opacity);
    }
  },
  params: [
    {
      key: "width",
      label: "宽度",
      type: "number",
      defaultValue: 0,
      group: "尺寸",
      constraints: { min: 0, max: 600, step: 1 },
      description: "0 = 自动",
    },
    {
      key: "height",
      label: "高度",
      type: "number",
      defaultValue: 0,
      group: "尺寸",
      constraints: { min: 0, max: 200, step: 1 },
      description: "0 = 自动",
    },
    {
      key: "label",
      label: "标签",
      type: "string",
      defaultValue: "",
      group: "内容",
      common: true,
    },
    {
      key: "value",
      label: "值",
      type: "slider",
      defaultValue: 50,
      group: "内容",
      common: true,
      constraints: { min: 0, max: 100, step: 1 },
    },
    {
      key: "trackWidth",
      label: "轨道宽度",
      type: "number",
      defaultValue: 200,
      group: "尺寸",
      constraints: { min: 40, max: 600, step: 1 },
    },
    {
      key: "trackHeight",
      label: "轨道高度",
      type: "number",
      defaultValue: 6,
      group: "尺寸",
      constraints: { min: 2, max: 20, step: 1 },
    },
    {
      key: "knobSize",
      label: "旋钮大小",
      type: "number",
      defaultValue: 20,
      group: "尺寸",
      constraints: { min: 8, max: 60, step: 1 },
    },
    {
      key: "labelFontSize",
      label: "标签字号",
      type: "number",
      defaultValue: 14,
      group: "文字",
      constraints: { min: 8, max: 36, step: 1 },
    },
    {
      key: "trackColor",
      label: "轨道颜色",
      type: "color",
      defaultValue: "",
      group: "颜色",
      themeVariable: "borderColor",
    },
    {
      key: "fillColor",
      label: "填充颜色",
      type: "color",
      defaultValue: "",
      group: "颜色",
      themeVariable: "primaryColor",
    },
    {
      key: "knobColor",
      label: "旋钮颜色",
      type: "color",
      defaultValue: "",
      group: "颜色",
      themeVariable: "backgroundColor",
    },
    {
      key: "opacity",
      label: "不透明度",
      type: "slider",
      defaultValue: 1,
      group: "外观",
      constraints: { min: 0, max: 1, step: 0.05 },
    },
  ],
  variants: [
    { name: "default", label: "默认" },
    { name: "disabled", label: "禁用", paramOverrides: { _state: "disabled" } },
  ],
  parts: [
    {
      id: "track",
      name: "轨道",
      render(ctx: RenderContext) {
        const { draw, params, theme, utils } = ctx;
        const { width, height } = computeTrackSize(params, theme);
        const state = (params._state as string) ?? "default";
        const value = params.value as number;
        const opacity = state === "disabled" ? theme.variables.disabledOpacity : (params.opacity as number);
        const trackColor = (params.trackColor as string) || theme.variables.borderColor.top;
        const fillColor = (params.fillColor as string) || theme.variables.primaryColor;
        const trackWidth = params.trackWidth as number;
        const trackHeight = params.trackHeight as number;
        const label = (params.label as string) || "";
        const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
        const labelColor = theme.variables.labelColor;
        const fontFamily = theme.variables.fontFamily;

        let trackY = (height - trackHeight) / 2;

        if (label) {
          utils.text.drawText(draw, {
            text: label,
            x: 0,
            y: 0,
            fontSize: labelFontSize,
            fontFamily,
            fill: labelColor,
            anchor: "start",
            verticalAlign: "top",
          });
          trackY = height - trackHeight;
        }

        // Track background
        utils.shapes.drawCapsule(draw, {
          x: 0,
          y: trackY,
          width: Math.min(trackWidth, width),
          height: trackHeight,
          fill: trackColor,
        });

        // Fill
        const fillWidth = (Math.min(trackWidth, width) * value) / 100;
        if (fillWidth > 0) {
          utils.shapes.drawCapsule(draw, {
            x: 0,
            y: trackY,
            width: Math.max(fillWidth, trackHeight),
            height: trackHeight,
            fill: fillColor,
          });
        }

        if (opacity < 1) {
          draw.opacity(opacity);
        }
      },
    },
    {
      id: "knob",
      name: "旋钮",
      render(ctx: RenderContext) {
        const { draw, params, theme, utils } = ctx;
        const { width, height } = computeKnobSize(params);
        const state = (params._state as string) ?? "default";
        const opacity = state === "disabled" ? theme.variables.disabledOpacity : (params.opacity as number);
        const knobColor = (params.knobColor as string) || theme.variables.backgroundColor;
        const fillColor = (params.fillColor as string) || theme.variables.primaryColor;

        utils.shapes.drawCircle(draw, {
          cx: width / 2,
          cy: height / 2,
          radius: width / 2 - 1,
          fill: knobColor,
          stroke: fillColor,
          strokeWidth: 2,
        });

        if (opacity < 1) {
          draw.opacity(opacity);
        }
      },
    },
  ],
};

export default sliderDef;
