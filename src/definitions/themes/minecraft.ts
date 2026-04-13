import type { ThemeDef, ThemeColors, CostumeOutput } from "@/core/types";
import { cornersOf } from "@/core/types";
import { renderToSvg } from "@/core/SvgRenderer";
import { renderButton } from "@/definitions/components/ButtonComponent";
import { renderCheckbox } from "@/definitions/components/CheckboxComponent";
import { renderToggle } from "@/definitions/components/ToggleComponent";
import { renderSliderTrack, renderSliderKnob } from "@/definitions/components/SliderComponent";
import { renderRadio } from "@/definitions/components/RadioComponent";
import { renderProgressBar } from "@/definitions/components/ProgressBarComponent";
import { renderTextInput } from "@/definitions/components/TextInputComponent";
import { renderTextLabel } from "@/definitions/components/TextLabelComponent";
import { darken, lighten } from "@/core/utils/colors";
import {
  generateButtonScripts,
  generateCheckboxScripts,
  generateToggleScripts,
  generateSliderScripts,
  generateRadioScripts,
  generateProgressBarScripts,
  generateTextInputScripts,
  generateTextLabelScripts,
} from "@/core/scratch-blocks";
import {
  labelParam,
  fontFamilyParam,
  fontSizeParam,
  fontWeightParam,
  opacityParam,
  iconParam,
  iconPositionParam,
  sizeParams,
  borderWidthParam,
  borderRadiusParam,
} from "@/definitions/common/params";

const DEFAULT_FONT_FAMILY = "Pixel";

/** Resolve font family from params, with fallback to default. */
function resolveFontFamily(params: Record<string, unknown>): string {
  return (params.fontFamily as string) || DEFAULT_FONT_FAMILY;
}

// ─── Helper: resolve MC button colors per state ──────────────────────

function resolveButtonColors(
  state: string,
  colors: ThemeColors
): { fill: string; textColor: string; borderColor: string; opacity: number } {
  let fill = colors.surface;
  const textColor = colors.text;
  const borderColor = colors.border;
  let opacity = 1;

  switch (state) {
    case "hover":
      fill = lighten(fill, 0.25);
      break;
    case "pressed":
      fill = darken(fill, 0.15);
      break;
    case "disabled":
      opacity = 0.4;
      break;
  }

  return { fill, textColor, borderColor, opacity };
}

// ─── Theme Definition ────────────────────────────────────────────────

export const minecraftTheme: ThemeDef = {
  id: "minecraft-theme",
  name: "Minecraft 主题",
  colorDefs: [
    { key: "primary", label: "主色调", defaultValue: "#6D6D6D" },
    { key: "onPrimary", label: "主色文字", defaultValue: "#FFFFFF" },
    { key: "secondary", label: "次要色", defaultValue: "#6D6D6D" },
    { key: "background", label: "背景色", defaultValue: "#6D6D6D" },
    { key: "surface", label: "表面色", defaultValue: "#6D6D6D" },
    { key: "text", label: "文字色", defaultValue: "#FFFFFF" },
    { key: "textSecondary", label: "次要文字", defaultValue: "#FFFFFF" },
    { key: "label", label: "标签色", defaultValue: "#FFFFFF" },
    { key: "border", label: "边框色", defaultValue: "#000000" },
  ],
  defaultColors: {
    primary: "#6D6D6D",
    onPrimary: "#FFFFFF",
    secondary: "#6D6D6D",
    background: "#6D6D6D",
    surface: "#6D6D6D",
    text: "#FFFFFF",
    textSecondary: "#FFFFFF",
    label: "#FFFFFF",
    border: "#000000",
  },
  components: {
    // ── Button ─────────────────────────────────────────────────────
    button: {
      name: "按钮",
      category: "基础",
      iconSlots: ["icon"],
      params: [
        { ...labelParam, defaultValue: "按钮" },
        { key: "stateDisabled", label: "禁用状态", type: "boolean", defaultValue: false, group: "状态", common: true },
        iconParam,
        iconPositionParam,
        ...sizeParams,
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        fontWeightParam,
        borderWidthParam(4),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const userOpacity = params.opacity as number ?? 1;
        const fontFamily = resolveFontFamily(params);
        // Always generate default, hover, pressed; optionally disabled
        const enabledStates = ["default", "hover", "pressed"];
        if (params.stateDisabled === true) enabledStates.push("disabled");

        return enabledStates.map((state) => {
          const resolved = resolveButtonColors(state, colors);
          const svg = renderToSvg((draw) => {
            renderButton(draw, {
              fill: resolved.fill,
              textColor: resolved.textColor,
              fontFamily,
              label: (params.label as string) ?? "按钮",
              icon: (params.icon as string) ?? "",
              iconPosition: (params.iconPosition as "left" | "right") ?? "left",
              fontSize: (params.fontSize as number) ?? 14,
              fontWeight: (params.fontWeight as string) ?? "bold",
              width: (params.width as number) ?? 0,
              height: (params.height as number) ?? 0,
              borderWidth: (params.borderWidth as number) ?? 4,
              borderColor: resolved.borderColor,
              borderRadius: cornersOf(0),
              opacity: resolved.opacity * userOpacity,
            });
          });
          return { name: `按钮-${state}`, svg };
        });
      },
      generateScripts(spriteName, costumeNames) {
        return generateButtonScripts({ spriteName, costumeNames });
      },
    },

    // ── Checkbox ───────────────────────────────────────────────────
    checkbox: {
      name: "复选框",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "复选框" },
        {
          key: "size",
          label: "选框大小",
          type: "number",
          defaultValue: 24,
          group: "尺寸",
          constraints: { min: 12, max: 60, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        borderWidthParam(4),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const fontFamily = resolveFontFamily(params);
        // Always generate both unchecked and checked costumes
        return [false, true].map((checked) => {
          const svg = renderToSvg((draw) => {
            renderCheckbox(draw, {
              checkboxColor: colors.primary,
              checkColor: colors.onPrimary,
              borderColor: colors.border,
              fontFamily,
              checked,
              uncheckedFill: colors.surface,
              size: (params.size as number) ?? 24,
              label: (params.label as string) ?? "复选框",
              labelFontSize: (params.fontSize as number) ?? 14,
              labelColor: colors.label,
              borderRadius: 0,
              opacity: (params.opacity as number) ?? 1,
            });
          });

          const stateName = checked ? "已勾选" : "未勾选";
          return { name: `复选框-${stateName}`, svg };
        });
      },
      generateScripts(_spriteName, costumeNames) {
        return generateCheckboxScripts({ costumeNames });
      },
    },

    // ── Toggle ─────────────────────────────────────────────────────
    toggle: {
      name: "开关",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "" },
        {
          key: "on",
          label: "开启",
          type: "boolean",
          defaultValue: false,
          group: "状态",
          common: true,
        },
        {
          key: "trackWidth",
          label: "轨道宽度",
          type: "number",
          defaultValue: 44,
          group: "尺寸",
          constraints: { min: 24, max: 120, step: 1 },
        },
        {
          key: "trackHeight",
          label: "轨道高度",
          type: "number",
          defaultValue: 22,
          group: "尺寸",
          constraints: { min: 14, max: 60, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const isOn = (params.on as boolean) ?? false;
        const fontFamily = resolveFontFamily(params);

        const svg = renderToSvg((draw) => {
          renderToggle(draw, {
            trackColor: isOn ? colors.primary : colors.border,
            knobColor: colors.background,
            fontFamily,
            on: isOn,
            trackWidth: (params.trackWidth as number) ?? 44,
            trackHeight: (params.trackHeight as number) ?? 22,
            label: (params.label as string) ?? "",
            labelFontSize: (params.fontSize as number) ?? 14,
            labelColor: colors.label,
            opacity: (params.opacity as number) ?? 1,
          });
        });

        const stateName = isOn ? "开启" : "关闭";
        return [{ name: `开关-${stateName}`, svg }];
      },
      generateScripts(_spriteName, costumeNames) {
        return generateToggleScripts({ costumeNames });
      },
    },

    // ── Slider ─────────────────────────────────────────────────────
    slider: {
      name: "滑块",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "" },
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
          key: "generateProgressSteps",
          label: "生成多进度造型",
          type: "boolean",
          defaultValue: false,
          group: "造型",
          common: true,
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
          defaultValue: 8,
          group: "尺寸",
          constraints: { min: 2, max: 20, step: 1 },
        },
        {
          key: "knobSize",
          label: "旋钮大小",
          type: "number",
          defaultValue: 24,
          group: "尺寸",
          constraints: { min: 8, max: 60, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const generateSteps = (params.generateProgressSteps as boolean) ?? false;
        const trackWidth = (params.trackWidth as number) ?? 200;
        const trackHeight = (params.trackHeight as number) ?? 8;
        const knobSize = (params.knobSize as number) ?? 24;
        const label = (params.label as string) ?? "";
        const labelFontSize = (params.fontSize as number) ?? 14;
        const opacity = (params.opacity as number) ?? 1;
        const fontFamily = resolveFontFamily(params);

        const trackCommon = {
          trackColor: colors.border,
          fillColor: colors.primary,
          fontFamily,
          trackWidth,
          trackHeight,
          label,
          labelFontSize,
          labelColor: colors.label,
          borderRadius: 0,
          opacity,
        };

        const costumes: CostumeOutput[] = [];

        if (generateSteps) {
          const step = Math.max(1, knobSize);
          const count = Math.ceil(trackWidth / step);
          for (let i = 0; i <= count; i++) {
            const v = Math.min(100, (i * step / trackWidth) * 100);
            costumes.push({
              name: `滑块轨道-${i}`,
              svg: renderToSvg((draw) => renderSliderTrack(draw, { ...trackCommon, value: v })),
            });
          }
        } else {
          const value = (params.value as number) ?? 50;
          costumes.push({
            name: "滑块轨道",
            svg: renderToSvg((draw) => renderSliderTrack(draw, { ...trackCommon, value })),
          });
        }

        costumes.push({
          name: "滑块旋钮",
          svg: renderToSvg((draw) =>
            renderSliderKnob(draw, {
              knobColor: colors.background,
              strokeColor: colors.primary,
              knobSize,
              strokeWidth: 4,
              opacity,
            })
          ),
        });

        return costumes;
      },
      generateScripts(_spriteName, costumeNames) {
        return generateSliderScripts({ costumeNames });
      },
    },

    // ── Radio ──────────────────────────────────────────────────────
    radio: {
      name: "单选框",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "选项" },
        {
          key: "size",
          label: "选框大小",
          type: "number",
          defaultValue: 24,
          group: "尺寸",
          constraints: { min: 12, max: 60, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const fontFamily = resolveFontFamily(params);
        return [false, true].map((selected) => {
          const svg = renderToSvg((draw) => {
            renderRadio(draw, {
              radioColor: colors.primary,
              dotColor: colors.onPrimary,
              borderColor: colors.border,
              fontFamily,
              selected,
              unselectedFill: colors.surface,
              size: (params.size as number) ?? 24,
              label: (params.label as string) ?? "选项",
              labelFontSize: (params.fontSize as number) ?? 14,
              labelColor: colors.label,
              opacity: (params.opacity as number) ?? 1,
            });
          });
          const stateName = selected ? "已选中" : "未选中";
          return { name: `单选框-${stateName}`, svg };
        });
      },
      generateScripts(_spriteName, costumeNames) {
        return generateRadioScripts({ costumeNames });
      },
    },

    // ── ProgressBar ────────────────────────────────────────────────
    progressBar: {
      name: "进度条",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "" },
        {
          key: "value",
          label: "进度值",
          type: "slider",
          defaultValue: 50,
          group: "内容",
          common: true,
          constraints: { min: 0, max: 100, step: 1 },
        },
        {
          key: "showPercent",
          label: "显示百分比",
          type: "boolean",
          defaultValue: false,
          group: "内容",
        },
        {
          key: "barWidth",
          label: "宽度",
          type: "number",
          defaultValue: 200,
          group: "尺寸",
          constraints: { min: 40, max: 600, step: 1 },
        },
        {
          key: "barHeight",
          label: "高度",
          type: "number",
          defaultValue: 12,
          group: "尺寸",
          constraints: { min: 4, max: 40, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        borderRadiusParam(0),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const fontFamily = resolveFontFamily(params);
        const value = (params.value as number) ?? 50;
        const svg = renderToSvg((draw) => {
          renderProgressBar(draw, {
            trackColor: colors.surface,
            fillColor: colors.primary,
            fontFamily,
            value,
            barWidth: (params.barWidth as number) ?? 200,
            barHeight: (params.barHeight as number) ?? 12,
            borderRadius: (params.borderRadius as number) ?? 0,
            label: (params.label as string) ?? "",
            labelFontSize: (params.fontSize as number) ?? 14,
            labelColor: colors.label,
            showPercent: (params.showPercent as boolean) ?? false,
            percentColor: colors.text,
            opacity: (params.opacity as number) ?? 1,
          });
        });
        return [{ name: "进度条", svg }];
      },
      generateScripts(_spriteName, costumeNames) {
        return generateProgressBarScripts({ costumeNames });
      },
    },

    // ── TextInput ──────────────────────────────────────────────────
    textInput: {
      name: "文本输入框",
      category: "基础",
      params: [
        {
          key: "placeholder",
          label: "占位文字",
          type: "string",
          defaultValue: "请输入…",
          group: "内容",
          common: true,
        },
        {
          key: "value",
          label: "文本内容",
          type: "string",
          defaultValue: "",
          group: "内容",
          common: true,
        },
        {
          key: "width",
          label: "宽度",
          type: "number",
          defaultValue: 200,
          group: "尺寸",
          constraints: { min: 60, max: 600, step: 1 },
        },
        {
          key: "height",
          label: "高度",
          type: "number",
          defaultValue: 36,
          group: "尺寸",
          constraints: { min: 24, max: 80, step: 1 },
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        borderRadiusParam(0),
        borderWidthParam(4),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const fontFamily = resolveFontFamily(params);
        const common = {
          fill: colors.background,
          borderColor: colors.border,
          textColor: colors.text,
          placeholderColor: colors.textSecondary,
          fontFamily,
          placeholder: (params.placeholder as string) ?? "请输入…",
          value: (params.value as string) ?? "",
          width: (params.width as number) ?? 200,
          height: (params.height as number) ?? 36,
          fontSize: (params.fontSize as number) ?? 14,
          borderWidth: (params.borderWidth as number) ?? 4,
          borderRadius: (params.borderRadius as number) ?? 0,
          opacity: (params.opacity as number) ?? 1,
        };

        return [
          {
            name: "输入框-默认",
            svg: renderToSvg((draw) => renderTextInput(draw, { ...common, focused: false })),
          },
          {
            name: "输入框-聚焦",
            svg: renderToSvg((draw) =>
              renderTextInput(draw, { ...common, focused: true, focusBorderColor: colors.primary }),
            ),
          },
        ];
      },
      generateScripts(_spriteName, costumeNames) {
        return generateTextInputScripts({ costumeNames });
      },
    },

    // ── TextLabel ──────────────────────────────────────────────────
    textLabel: {
      name: "文本标签",
      category: "基础",
      params: [
        {
          key: "text",
          label: "文本",
          type: "string",
          defaultValue: "文本",
          group: "内容",
          common: true,
        },
        { ...fontFamilyParam, defaultValue: "Pixel" },
        fontSizeParam,
        fontWeightParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const fontFamily = resolveFontFamily(params);
        const svg = renderToSvg((draw) => {
          renderTextLabel(draw, {
            textColor: colors.text,
            fontFamily,
            text: (params.text as string) ?? "文本",
            fontSize: (params.fontSize as number) ?? 14,
            fontWeight: (params.fontWeight as string) ?? "normal",
            opacity: (params.opacity as number) ?? 1,
          });
        });
        return [{ name: "文本标签", svg }];
      },
      generateScripts(_spriteName, costumeNames) {
        return generateTextLabelScripts({ costumeNames });
      },
    },
  },
};
