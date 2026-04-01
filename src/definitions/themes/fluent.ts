import type { ThemeDef, ThemeColors, CostumeOutput } from "@/core/types";
import { cornersOf } from "@/core/types";
import { renderToSvg } from "@/core/SvgRenderer";
import { renderButton } from "@/definitions/components/ButtonComponent";
import { renderCheckbox } from "@/definitions/components/CheckboxComponent";
import { renderToggle } from "@/definitions/components/ToggleComponent";
import { renderSliderTrack, renderSliderKnob } from "@/definitions/components/SliderComponent";
import { lighten, darken, withAlpha, lerpColor } from "@/core/utils/colors";
import { easyEase, generateFrameTimes } from "@/core/utils/tween";
import {
  labelParam,
  fontSizeParam,
  fontWeightParam,
  opacityParam,
  iconParam,
  iconPositionParam,
  sizeParams,
  buttonStyleParam,
  borderRadiusParam,
  borderWidthParam,
} from "@/definitions/common/params";

const FONT_FAMILY = "Sans Serif, Segoe UI, Helvetica, Arial, sans-serif";

// ─── Helper: resolve button colors per style + state ─────────────────

function resolveButtonColors(
  style: string,
  state: string,
  colors: ThemeColors
): { fill: string; textColor: string; borderColor: string; borderWidth: number; opacity: number } {
  const primary = colors.primary;
  const surface = colors.surface;

  let fill: string;
  let textColor: string;
  let borderColor: string;
  let borderWidth: number;
  let opacity = 1;

  switch (style) {
    case "secondary":
      fill = surface;
      textColor = colors.text;
      borderColor = colors.border;
      borderWidth = 2;
      break;
    case "outline":
      fill = "transparent";
      textColor = primary;
      borderColor = primary;
      borderWidth = 1.5;
      break;
    case "ghost":
      fill = "transparent";
      textColor = primary;
      borderColor = "none";
      borderWidth = 0;
      break;
    default:
      fill = primary;
      textColor = colors.onPrimary;
      borderColor = "none";
      borderWidth = 0;
      break;
  }

  switch (state) {
    case "hover":
      if (style === "outline" || style === "ghost") {
        fill = withAlpha(primary, 0.1);
      } else {
        fill = lighten(fill, 0.15);
      }
      break;
    case "pressed":
      if (style === "outline" || style === "ghost") {
        fill = withAlpha(primary, 0.2);
      } else {
        fill = darken(fill, 0.15);
      }
      break;
    case "disabled":
      opacity = 0.4;
      break;
  }

  return { fill, textColor, borderColor, borderWidth, opacity };
}

// ─── Theme Definition ────────────────────────────────────────────────

export const fluentTheme: ThemeDef = {
  id: "fluent",
  name: "Fluent UI",
  colorDefs: [
    { key: "primary", label: "主色调", defaultValue: "#0F6CBD" },
    { key: "onPrimary", label: "主色文字", defaultValue: "#FFFFFF" },
    { key: "secondary", label: "次要色", defaultValue: "#FFFFFF" },
    { key: "background", label: "背景色", defaultValue: "#FAFAFA" },
    { key: "surface", label: "表面色", defaultValue: "#F5F5F5" },
    { key: "text", label: "文字色", defaultValue: "#242424" },
    { key: "textSecondary", label: "次要文字", defaultValue: "#616161" },
    { key: "label", label: "标签色", defaultValue: "#242424" },
    { key: "border", label: "边框色", defaultValue: "#D1D1D1" },
  ],
  defaultColors: {
    primary: "#0F6CBD",
    onPrimary: "#FFFFFF",
    secondary: "#FFFFFF",
    background: "#FAFAFA",
    surface: "#F5F5F5",
    text: "#242424",
    textSecondary: "#616161",
    label: "#242424",
    border: "#D1D1D1",
  },
  components: {
    // ── Button ─────────────────────────────────────────────────────
    button: {
      name: "按钮",
      category: "基础",
      iconSlots: ["icon"],
      params: [
        { ...labelParam, defaultValue: "按钮" },
        buttonStyleParam(),
        { key: "stateDefault", label: "默认状态", type: "boolean", defaultValue: true, group: "状态", common: true },
        { key: "stateHover", label: "悬停状态", type: "boolean", defaultValue: true, group: "状态", common: true },
        { key: "statePressed", label: "按下状态", type: "boolean", defaultValue: true, group: "状态", common: true },
        { key: "stateDisabled", label: "禁用状态", type: "boolean", defaultValue: true, group: "状态", common: true },
        iconParam,
        iconPositionParam,
        ...sizeParams,
        fontSizeParam,
        fontWeightParam,
        borderRadiusParam(4),
        borderWidthParam(0),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const style = (params.style as string) || "primary";
        const userOpacity = params.opacity as number ?? 1;
        const allStates: [string, string][] = [
          ["default", "stateDefault"],
          ["hover", "stateHover"],
          ["pressed", "statePressed"],
          ["disabled", "stateDisabled"],
        ];
        const enabledStates = allStates.filter(([, key]) => params[key] !== false).map(([s]) => s);
        if (enabledStates.length === 0) enabledStates.push("default");

        return enabledStates.map((state) => {
          const resolved = resolveButtonColors(style, state, colors);
          const svg = renderToSvg((draw) => {
            renderButton(draw, {
              fill: resolved.fill,
              textColor: resolved.textColor,
              fontFamily: FONT_FAMILY,
              label: (params.label as string) ?? "按钮",
              icon: (params.icon as string) ?? "",
              iconPosition: (params.iconPosition as "left" | "right") ?? "left",
              fontSize: (params.fontSize as number) ?? 14,
              fontWeight: (params.fontWeight as string) ?? "bold",
              width: (params.width as number) ?? 0,
              height: (params.height as number) ?? 0,
              borderWidth: resolved.borderWidth,
              borderColor: resolved.borderColor,
              borderRadius: cornersOf((params.borderRadius as number) ?? 4),
              opacity: resolved.opacity * userOpacity,
            });
          });
          return { name: `按钮-${state}`, svg };
        });
      },
    },

    // ── Checkbox ───────────────────────────────────────────────────
    checkbox: {
      name: "复选框",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "复选框" },
        {
          key: "checked",
          label: "勾选",
          type: "boolean",
          defaultValue: false,
          group: "状态",
          common: true,
        },
        {
          key: "size",
          label: "选框大小",
          type: "number",
          defaultValue: 20,
          group: "尺寸",
          constraints: { min: 12, max: 60, step: 1 },
        },
        fontSizeParam,
        borderRadiusParam(4),
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const checked = (params.checked as boolean) ?? false;
        const svg = renderToSvg((draw) => {
          renderCheckbox(draw, {
            checkboxColor: colors.primary,
            checkColor: colors.onPrimary,
            borderColor: colors.border,
            fontFamily: FONT_FAMILY,
            checked,
            uncheckedFill: colors.surface,
            size: (params.size as number) ?? 20,
            label: (params.label as string) ?? "复选框",
            labelFontSize: (params.fontSize as number) ?? 14,
            labelColor: colors.label,
            borderRadius: (params.borderRadius as number) ?? 4,
            opacity: (params.opacity as number) ?? 1,
          });
        });

        const stateName = checked ? "已勾选" : "未勾选";
        return [{ name: `复选框-${stateName}`, svg }];
      },
    },

    // ── Toggle ─────────────────────────────────────────────────────
    toggle: {
      name: "开关",
      category: "基础",
      params: [
        { ...labelParam, defaultValue: "" },
        {
          key: "generateAnimFrames",
          label: "生成动画帧",
          type: "boolean",
          defaultValue: false,
          group: "造型",
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
        fontSizeParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const generateAnimFrames = (params.generateAnimFrames as boolean) ?? false;
        const trackWidth = (params.trackWidth as number) ?? 44;
        const trackHeight = (params.trackHeight as number) ?? 22;
        const label = (params.label as string) ?? "";
        const labelFontSize = (params.fontSize as number) ?? 14;
        const opacity = (params.opacity as number) ?? 1;

        const costumes: CostumeOutput[] = [];

        // Default: two static costumes (off + on)
        for (const isOn of [false, true]) {
          const svg = renderToSvg((draw) => {
            renderToggle(draw, {
              trackColor: isOn ? colors.primary : colors.border,
              knobColor: colors.background,
              fontFamily: FONT_FAMILY,
              on: isOn,
              trackWidth,
              trackHeight,
              label,
              labelFontSize,
              labelColor: colors.label,
              opacity,
            });
          });
          costumes.push({ name: `开关-${isOn ? "开启" : "关闭"}`, svg });
        }

        // Optional: animation frames (off → on), easyEase, 30fps, 200ms
        if (generateAnimFrames) {
          const frameTimes = generateFrameTimes(30, 200);
          frameTimes.forEach((t, i) => {
            const eased = easyEase(t);
            const svg = renderToSvg((draw) => {
              renderToggle(draw, {
                trackColor: lerpColor(colors.border, colors.primary, eased),
                knobColor: colors.background,
                fontFamily: FONT_FAMILY,
                progress: eased,
                trackWidth,
                trackHeight,
                label,
                labelFontSize,
                labelColor: colors.label,
                opacity,
              });
            });
            costumes.push({ name: `开关-动画-${i}`, svg });
          });
        }

        return costumes;
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
        fontSizeParam,
        opacityParam,
      ],
      generateCostumes(colors: ThemeColors, params: Record<string, unknown>): CostumeOutput[] {
        const generateSteps = (params.generateProgressSteps as boolean) ?? false;
        const trackWidth = (params.trackWidth as number) ?? 200;
        const trackHeight = (params.trackHeight as number) ?? 6;
        const knobSize = (params.knobSize as number) ?? 20;
        const label = (params.label as string) ?? "";
        const labelFontSize = (params.fontSize as number) ?? 14;
        const opacity = (params.opacity as number) ?? 1;

        const trackCommon = {
          trackColor: colors.border,
          fillColor: colors.primary,
          fontFamily: FONT_FAMILY,
          trackWidth,
          trackHeight,
          label,
          labelFontSize,
          labelColor: colors.label,
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
              opacity,
            })
          ),
        });

        return costumes;
      },
    },
  },
};
