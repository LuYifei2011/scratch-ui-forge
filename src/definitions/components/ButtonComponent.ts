import type { ScratchComponentDef, RenderContext, ResolvedTheme } from '@/core/types';
import { sidesOf, cornersOf } from '@/core/types';
import { measureText } from '@/core/utils/text';

function computeButtonSize(params: Record<string, unknown>, theme: ResolvedTheme) {
  const label = (params.label as string) || '';
  const fontSize = (params.fontSize as number) || theme.variables.fontSize;
  const fontWeight = (params.fontWeight as string) || 'bold';
  const fontFamily = theme.variables.fontFamily;
  const iconName = params.icon as string;
  const hasIcon = !!iconName;
  // const iconSize = fontSize + 2;
  const iconSize = fontSize;
  const gap = hasIcon && label ? 6 : 0;
  const paddingX = Math.max(14, fontSize);
  const paddingY = Math.max(8, Math.round(fontSize * 0.6));
  const bw = (params.borderWidth as number) ?? -1;
  const borderWidth = bw < 0 ? theme.variables.borderWidth.top : bw;

  const textWidth = label ? measureText(label, fontSize, fontFamily, fontWeight) : 0;
  const contentWidth = textWidth + (hasIcon ? iconSize + gap : 0);

  return {
    width: Math.ceil(contentWidth + paddingX * 2 + borderWidth * 2),
    height: Math.ceil(Math.max(fontSize, hasIcon ? iconSize : fontSize) + paddingY * 2 + borderWidth * 2),
  };
}

const buttonDef: ScratchComponentDef = {
  id: 'button',
  name: '按钮',
  category: '基础',
  iconSlots: ['icon'],
  params: [
    {
      key: 'width',
      label: '宽度',
      type: 'number',
      defaultValue: 0,
      group: '尺寸',
      constraints: { min: 0, max: 600, step: 1 },
      description: '0 = 自动',
    },
    {
      key: 'height',
      label: '高度',
      type: 'number',
      defaultValue: 0,
      group: '尺寸',
      constraints: { min: 0, max: 600, step: 1 },
      description: '0 = 自动',
    },
    {
      key: 'label',
      label: '标签',
      type: 'string',
      defaultValue: '按钮',
      group: '内容',
      common: true,
    },
    {
      key: 'style',
      label: '样式',
      type: 'select',
      defaultValue: 'primary',
      group: '外观',
      common: true,
      constraints: {
        options: [
          { label: '主要', value: 'primary' },
          { label: '次要', value: 'secondary' },
          { label: '描边', value: 'outline' },
          { label: '幽灵', value: 'ghost' },
        ],
      },
    },
    {
      key: 'icon',
      label: '图标',
      type: 'icon',
      defaultValue: '',
      group: '内容',
      common: true,
    },
    {
      key: 'iconPosition',
      label: '图标位置',
      type: 'select',
      defaultValue: 'left',
      group: '内容',
      constraints: {
        options: [
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
        ],
      },
    },
    {
      key: 'fontSize',
      label: '字号',
      type: 'number',
      defaultValue: 14,
      group: '文字',
      constraints: { min: 8, max: 48, step: 1 },
    },
    {
      key: 'fontWeight',
      label: '字重',
      type: 'select',
      defaultValue: 'bold',
      group: '文字',
      constraints: {
        options: [
          { label: '常规', value: 'normal' },
          { label: '粗体', value: 'bold' },
        ],
      },
    },
    {
      key: 'textColor',
      label: '文字颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'onPrimaryColor',
    },
    {
      key: 'bgColor',
      label: '背景颜色',
      type: 'color',
      defaultValue: '',
      group: '颜色',
      themeVariable: 'primaryColor',
    },
    {
      key: 'borderRadius',
      label: '圆角',
      type: 'number',
      defaultValue: -1,
      group: '外观',
      constraints: { min: -1, max: 100, step: 1 },
      description: '-1 = 主题默认',
      themeVariable: 'borderRadius',
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
      key: 'borderWidth',
      label: '边框宽度',
      type: 'number',
      defaultValue: -1,
      group: '外观',
      constraints: { min: -1, max: 10, step: 0.5 },
      description: '-1 = 主题默认',
      themeVariable: 'borderWidth',
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
    { name: 'default', label: '默认' },
    { name: 'hover', label: '悬停', paramOverrides: { _state: 'hover' } },
    { name: 'pressed', label: '按下', paramOverrides: { _state: 'pressed' } },
    { name: 'disabled', label: '禁用', paramOverrides: { _state: 'disabled' } },
  ],
  render(ctx: RenderContext) {
    const { draw, params, theme, utils } = ctx;
    const { width, height } = computeButtonSize(params, theme);
    const { lighten, darken, withAlpha } = utils.colors;
    const state = (params._state as string) ?? 'default';
    const style = (params.style as string) || 'primary';

    const primary = theme.variables.primaryColor;
    const surface = theme.variables.surfaceColor;

    // Style-based defaults derived from base theme variables
    let defaultBg: string;
    let defaultText: string;
    let defaultBorderColor: string;
    let defaultBorderWidth: number;

    switch (style) {
      case 'secondary':
        defaultBg = surface;
        defaultText = theme.variables.textColor;
        defaultBorderColor = theme.variables.borderColor.top;
        defaultBorderWidth = theme.variables.borderWidth.top;
        break;
      case 'outline':
        defaultBg = 'transparent';
        defaultText = primary;
        defaultBorderColor = primary;
        defaultBorderWidth = 1.5;
        break;
      case 'ghost':
        defaultBg = 'transparent';
        defaultText = primary;
        defaultBorderColor = 'none';
        defaultBorderWidth = 0;
        break;
      default: // primary
        defaultBg = primary;
        defaultText = theme.variables.onPrimaryColor;
        defaultBorderColor = 'none';
        defaultBorderWidth = 0;
        break;
    }

    // Resolve param overrides → style defaults
    let bgColor = (params.bgColor as string) || defaultBg;

    // Hover / pressed state color derivation
    if (state === 'hover') {
      if (style === 'outline' || style === 'ghost') {
        bgColor = withAlpha(primary, 0.1);
      } else {
        bgColor = lighten((params.bgColor as string) || defaultBg, 0.15);
      }
    }
    if (state === 'pressed') {
      if (style === 'outline' || style === 'ghost') {
        bgColor = withAlpha(primary, 0.2);
      } else {
        bgColor = darken((params.bgColor as string) || defaultBg, 0.15);
      }
    }

    const opacity = state === 'disabled' ? theme.variables.disabledOpacity : (params.opacity as number);
    const textColor = (params.textColor as string) || defaultText;
    const borderRadius = (params.borderRadius as number) < 0 ? theme.variables.borderRadius : cornersOf(params.borderRadius as number);
    const borderColorVal = (params.borderColor as string) || ((params.borderWidth as number) >= 0 ? theme.variables.borderColor.top : defaultBorderColor);
    const borderWidthVal = (params.borderWidth as number) < 0 ? defaultBorderWidth : (params.borderWidth as number);
    const label = (params.label as string) || '';
    const fontSize = params.fontSize as number;
    const fontWeight = params.fontWeight as string;
    const fontFamily = theme.variables.fontFamily;
    const iconName = params.icon as string;
    const iconPosition = params.iconPosition as string;

    // Background
    utils.shapes.drawRect(draw, {
      width,
      height,
      fill: bgColor,
      border: {
        width: sidesOf(borderWidthVal),
        color: sidesOf(borderWidthVal > 0 ? borderColorVal : 'none'),
        radius: borderRadius,
      },
      opacity,
    });

    // Icon + Text layout
    const iconSize = fontSize + 2;
    const hasIcon = !!iconName;
    const gap = hasIcon && label ? 6 : 0;
    const textWidth = label ? measureText(label, fontSize, fontFamily, fontWeight) : 0;
    const totalWidth = textWidth + (hasIcon ? iconSize + gap : 0);
    let startX = (width - totalWidth) / 2;

    if (hasIcon && iconPosition === 'left') {
      utils.icons.drawIcon(draw, iconName, startX, (height - iconSize) / 2, iconSize, textColor);
      startX += iconSize + gap;
    }

    if (label) {
      utils.text.drawCenteredText(draw, label, hasIcon ? startX + textWidth / 2 : width / 2, height / 2, {
        fontSize,
        fill: textColor,
        fontWeight,
        fontFamily,
      });
    }

    if (hasIcon && iconPosition === 'right') {
      utils.icons.drawIcon(draw, iconName, startX + textWidth + gap, (height - iconSize) / 2, iconSize, textColor);
    }
  },
};

export default buttonDef;
