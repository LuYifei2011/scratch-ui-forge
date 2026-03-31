import type { ThemeParam } from "@/core/types";

/**
 * Reusable parameter presets for themes.
 * Import and spread into ThemeComponentDef.params arrays.
 */

// ─── Common single params ────────────────────────────────────────────

export const labelParam: ThemeParam = {
  key: "label",
  label: "标签",
  type: "string",
  defaultValue: "按钮",
  group: "内容",
  common: true,
};

export const fontSizeParam: ThemeParam = {
  key: "fontSize",
  label: "字号",
  type: "number",
  defaultValue: 14,
  group: "文字",
  constraints: { min: 8, max: 48, step: 1 },
};

export const fontWeightParam: ThemeParam = {
  key: "fontWeight",
  label: "字重",
  type: "select",
  defaultValue: "bold",
  group: "文字",
  constraints: {
    options: [
      { label: "常规", value: "normal" },
      { label: "粗体", value: "bold" },
    ],
  },
};

export const opacityParam: ThemeParam = {
  key: "opacity",
  label: "不透明度",
  type: "slider",
  defaultValue: 1,
  group: "外观",
  constraints: { min: 0, max: 1, step: 0.05 },
};

export const iconParam: ThemeParam = {
  key: "icon",
  label: "图标",
  type: "icon",
  defaultValue: "",
  group: "内容",
  common: true,
};

export const iconPositionParam: ThemeParam = {
  key: "iconPosition",
  label: "图标位置",
  type: "select",
  defaultValue: "left",
  group: "内容",
  constraints: {
    options: [
      { label: "左侧", value: "left" },
      { label: "右侧", value: "right" },
    ],
  },
};

// ─── Size params ─────────────────────────────────────────────────────

export const widthParam: ThemeParam = {
  key: "width",
  label: "宽度",
  type: "number",
  defaultValue: 0,
  group: "尺寸",
  constraints: { min: 0, max: 600, step: 1 },
  description: "0 = 自动",
};

export const heightParam: ThemeParam = {
  key: "height",
  label: "高度",
  type: "number",
  defaultValue: 0,
  group: "尺寸",
  constraints: { min: 0, max: 600, step: 1 },
  description: "0 = 自动",
};

export const sizeParams: ThemeParam[] = [widthParam, heightParam];

// ─── Button state params (for Fluent-style themes) ───────────────────

export function buttonStateParam(defaultValue = "default"): ThemeParam {
  return {
    key: "state",
    label: "状态",
    type: "select",
    defaultValue,
    group: "状态",
    common: true,
    constraints: {
      options: [
        { label: "默认", value: "default" },
        { label: "悬停", value: "hover" },
        { label: "按下", value: "pressed" },
        { label: "禁用", value: "disabled" },
      ],
    },
  };
}

export function buttonStyleParam(defaultValue = "primary"): ThemeParam {
  return {
    key: "style",
    label: "样式",
    type: "select",
    defaultValue,
    group: "外观",
    common: true,
    constraints: {
      options: [
        { label: "主要", value: "primary" },
        { label: "次要", value: "secondary" },
        { label: "描边", value: "outline" },
        { label: "幽灵", value: "ghost" },
      ],
    },
  };
}

// ─── Common param groups ─────────────────────────────────────────────

export const borderRadiusParam = (defaultValue = 4): ThemeParam => ({
  key: "borderRadius",
  label: "圆角",
  type: "number",
  defaultValue,
  group: "外观",
  constraints: { min: 0, max: 100, step: 1 },
});

export const borderWidthParam = (defaultValue = 2): ThemeParam => ({
  key: "borderWidth",
  label: "边框宽度",
  type: "number",
  defaultValue,
  group: "外观",
  constraints: { min: 0, max: 10, step: 0.5 },
});
