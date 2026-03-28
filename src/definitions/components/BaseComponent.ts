import type { ComponentParam, RenderContext } from '@/core/types';

/**
 * Base parameters shared by all components.
 */
export const baseParams: ComponentParam[] = [
  {
    key: 'width',
    label: '宽度',
    type: 'number',
    defaultValue: 120,
    group: '尺寸',
    constraints: { min: 20, max: 600, step: 1 },
  },
  {
    key: 'height',
    label: '高度',
    type: 'number',
    defaultValue: 40,
    group: '尺寸',
    constraints: { min: 20, max: 600, step: 1 },
  },
  {
    key: 'opacity',
    label: '不透明度',
    type: 'slider',
    defaultValue: 1,
    group: '外观',
    constraints: { min: 0, max: 1, step: 0.05 },
  },
];

/**
 * Render a base background + border rectangle.
 */
export function renderBase(
  ctx: RenderContext,
  fillColor?: string,
  strokeColor?: string,
  strokeWidth?: number,
  borderRadius?: number
): void {
  const fill = fillColor ?? ctx.theme.variables.surfaceColor;
  const stroke = strokeColor ?? ctx.theme.variables.borderColor.top;
  const sw = strokeWidth ?? ctx.theme.variables.borderWidth.top;
  const r = borderRadius ?? ctx.theme.variables.borderRadius.topLeft;
  const opacity = (ctx.params.opacity as number) ?? 1;

  ctx.utils.shapes.drawRoundedRect(ctx.draw, {
    x: sw / 2,
    y: sw / 2,
    width: ctx.width - sw,
    height: ctx.height - sw,
    radius: r,
    fill,
    stroke,
    strokeWidth: sw,
    opacity,
  });
}
