import type { ScratchComponentDef, RenderContext, ResolvedTheme } from '@/core/types';
import { measureText } from '@/core/utils/text';

const LABEL_GAP = 8;

function computeCheckboxSize(params: Record<string, unknown>, theme: ResolvedTheme) {
  const size = (params.size as number) || 20;
  const label = (params.label as string) || '';
  const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
  const fontFamily = theme.variables.fontFamily;

  if (!label) {
    return { width: size, height: size };
  }

  const labelWidth = measureText(label, labelFontSize, fontFamily, 'normal');
  return {
    width: Math.ceil(size + LABEL_GAP + labelWidth),
    height: Math.ceil(Math.max(size, labelFontSize * 1.4)),
  };
}

const checkboxDef: ScratchComponentDef = {
  id: 'checkbox',
  name: '复选框',
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
      defaultValue: '复选框',
      group: '内容',
      common: true,
    },
    {
      key: 'size',
      label: '选框大小',
      type: 'number',
      defaultValue: 20,
      group: '尺寸',
      constraints: { min: 12, max: 60, step: 1 },
    },
    {
      key: 'checked',
      label: '勾选',
      type: 'boolean',
      defaultValue: false,
      group: '状态',
      variantDriven: true,
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
      key: 'checkboxColor',
      label: '选框颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'primaryColor',
    },
    {
      key: 'checkColor',
      label: '勾选颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'onPrimaryColor',
    },
    {
      key: 'borderColor',
      label: '边框颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'borderColor',
    },
    {
      key: 'borderRadius',
      label: '圆角',
      type: 'number',
      defaultValue: -1,
      group: '外观',
      constraints: { min: -1, max: 50, step: 1 },
      description: '-1 = 主题默认',
      themeVariable: 'borderRadius',
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
    { name: 'unchecked', label: '未勾选', paramOverrides: { checked: false } },
    { name: 'checked', label: '已勾选', paramOverrides: { checked: true } },
  ],
  render(ctx: RenderContext) {
    const { draw, params, theme, utils } = ctx;
    const { height } = computeCheckboxSize(params, theme);
    const checked = params.checked as boolean;
    const opacity = params.opacity as number;
    const size = params.size as number;
    const label = (params.label as string) || '';
    const labelFontSize = (params.labelFontSize as number) || theme.variables.fontSize;
    const borderRadius = (params.borderRadius as number) < 0 ? theme.variables.borderRadius.topLeft : (params.borderRadius as number);
    const checkboxColor = (params.checkboxColor as string) || theme.variables.primaryColor;
    const checkColor = (params.checkColor as string) || theme.variables.onPrimaryColor;
    const borderColor = (params.borderColor as string) || theme.variables.borderColor.top;
    const labelColor = theme.variables.labelColor;
    const fontFamily = theme.variables.fontFamily;

    const boxY = (height - size) / 2;

    // Checkbox box
    const bgFill = checked ? checkboxColor : theme.variables.surfaceColor;
    const strokeColor = checked ? checkboxColor : borderColor;

    utils.shapes.drawRoundedRect(draw, {
      x: 1,
      y: boxY + 1,
      width: size - 2,
      height: size - 2,
      radius: Math.min(borderRadius, size / 2),
      fill: bgFill,
      stroke: strokeColor,
      strokeWidth: 2,
      opacity,
    });

    // Checkmark
    if (checked) {
      const scale = (size - 4) / 24;
      const offsetX = -2;
      const offsetY = boxY - 2;
      const group = draw.group();
      group
        .path('M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z')
        .fill(checkColor)
        .transform({ scaleX: scale, scaleY: scale });
      group.translate(offsetX, offsetY);
    }

    // Label
    if (label) {
      utils.text.drawText(draw, {
        text: label,
        x: size + LABEL_GAP,
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

export default checkboxDef;
