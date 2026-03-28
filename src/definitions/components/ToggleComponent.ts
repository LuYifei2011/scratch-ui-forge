import type { ScratchComponentDef, RenderContext, ResolvedTheme } from '@/core/types';
import { measureText } from '@/core/utils/text';

const LABEL_GAP = 8;

function computeToggleSize(params: Record<string, unknown>, theme: ResolvedTheme) {
  const trackWidth = (params.trackWidth as number) || 44;
  const trackHeight = (params.trackHeight as number) || 22;
  const label = (params.label as string) || '';
  const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
  const fontFamily = theme.variables.fontFamily;

  if (!label) {
    return { width: trackWidth, height: trackHeight };
  }

  const labelWidth = measureText(label, labelFontSize, fontFamily, 'normal');
  return {
    width: Math.ceil(trackWidth + LABEL_GAP + labelWidth),
    height: Math.ceil(Math.max(trackHeight, labelFontSize * 1.4)),
  };
}

const toggleDef: ScratchComponentDef = {
  id: 'toggle',
  name: '开关',
  category: '基础',
  params: [
    {
      key: 'width',
      label: '宽度',
      type: 'number',
      defaultValue: 0,
      group: '尺寸',
      constraints: { min: 0, max: 400, step: 1 },
      description: '0 = 自动',
    },
    {
      key: 'height',
      label: '高度',
      type: 'number',
      defaultValue: 0,
      group: '尺寸',
      constraints: { min: 0, max: 200, step: 1 },
      description: '0 = 自动',
    },
    {
      key: 'label',
      label: '标签',
      type: 'string',
      defaultValue: '',
      group: '内容',
      common: true,
    },
    {
      key: 'on',
      label: '开启',
      type: 'boolean',
      defaultValue: false,
      group: '状态',
      variantDriven: true,
    },
    {
      key: 'trackWidth',
      label: '轨道宽度',
      type: 'number',
      defaultValue: 44,
      group: '尺寸',
      constraints: { min: 24, max: 120, step: 1 },
    },
    {
      key: 'trackHeight',
      label: '轨道高度',
      type: 'number',
      defaultValue: 22,
      group: '尺寸',
      constraints: { min: 14, max: 60, step: 1 },
    },
    {
      key: 'labelFontSize',
      label: '标签字号',
      type: 'number',
      defaultValue: 14,
      group: '文字',
      constraints: { min: 8, max: 36, step: 1 },
    },
    {
      key: 'trackOnColor',
      label: '开启轨道颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'primaryColor',
    },
    {
      key: 'trackOffColor',
      label: '关闭轨道颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'borderColor',
    },
    {
      key: 'knobColor',
      label: '旋钮颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'backgroundColor',
    },
    {
      key: 'opacity',
      label: '不透明度',
      type: 'slider',
      defaultValue: 1,
      group: '外观',
      constraints: { min: 0, max: 1, step: 0.05 },
    },
  ],
  variants: [
    { name: 'off', label: '关闭', paramOverrides: { on: false } },
    { name: 'on', label: '开启', paramOverrides: { on: true } },
  ],
  render(ctx: RenderContext) {
    const { draw, params, theme, utils } = ctx;
    const { height } = computeToggleSize(params, theme);
    const isOn = params.on as boolean;
    const opacity = params.opacity as number;
    const trackWidth = params.trackWidth as number;
    const trackHeight = params.trackHeight as number;
    const label = (params.label as string) || '';
    const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
    const trackOnColor = (params.trackOnColor as string) || theme.variables.primaryColor;
    const trackOffColor = (params.trackOffColor as string) || theme.variables.borderColor.top;
    const knobColor = (params.knobColor as string) || theme.variables.backgroundColor;
    const labelColor = theme.variables.labelColor;
    const fontFamily = theme.variables.fontFamily;

    const trackColor = isOn ? trackOnColor : trackOffColor;
    const trackY = (height - trackHeight) / 2;
    const knobRadius = (trackHeight - 4) / 2;
    const knobCx = isOn ? trackWidth - knobRadius - 3 : knobRadius + 3;
    const knobCy = height / 2;

    // Track
    utils.shapes.drawCapsule(draw, {
      x: 0,
      y: trackY,
      width: trackWidth,
      height: trackHeight,
      fill: trackColor,
    });

    // Knob
    utils.shapes.drawCircle(draw, {
      cx: knobCx,
      cy: knobCy,
      radius: knobRadius,
      fill: knobColor,
    });

    // Label
    if (label) {
      utils.text.drawText(draw, {
        text: label,
        x: trackWidth + LABEL_GAP,
        y: height / 2,
        fontSize: labelFontSize,
        fontFamily,
        fill: labelColor,
        anchor: 'start',
        verticalAlign: 'middle',
      });
    }

    if (opacity < 1) {
      draw.opacity(opacity);
    }
  },
};

export default toggleDef;
