import type { Container } from '@svgdotjs/svg.js';

// ─── Border / Spacing Primitives ──────────────────────────────────────

/** Per-side values (border width, border color, padding, etc.) */
export interface Sides<T> {
  top: T;
  right: T;
  bottom: T;
  left: T;
}

/** Per-corner values (border radius) */
export interface Corners<T> {
  topLeft: T;
  topRight: T;
  bottomRight: T;
  bottomLeft: T;
}

/** Expand a single value into `Sides<T>` (all sides equal). */
export function sidesOf<T>(value: T): Sides<T> {
  return { top: value, right: value, bottom: value, left: value };
}

/** Expand a single value into `Corners<T>` (all corners equal). */
export function cornersOf<T>(value: T): Corners<T> {
  return { topLeft: value, topRight: value, bottomRight: value, bottomLeft: value };
}

/** Normalize shorthand → Sides. If already a Sides object, return as-is. */
export function normalizeSides<T>(input: T | Sides<T>): Sides<T> {
  if (input !== null && typeof input === 'object' && 'top' in (input as object)) {
    return input as Sides<T>;
  }
  return sidesOf(input as T);
}

/** Normalize shorthand → Corners. If already a Corners object, return as-is. */
export function normalizeCorners<T>(input: T | Corners<T>): Corners<T> {
  if (input !== null && typeof input === 'object' && 'topLeft' in (input as object)) {
    return input as Corners<T>;
  }
  return cornersOf(input as T);
}

// ─── Component Parameter Declaration ─────────────────────────────────

export type ParamType =
  | 'number'
  | 'string'
  | 'color'
  | 'boolean'
  | 'select'
  | 'slider'
  | 'icon';

export interface ParamConstraints {
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
}

export interface ComponentParam {
  key: string;
  label: string;
  type: ParamType;
  defaultValue: unknown;
  group?: string;
  constraints?: ParamConstraints;
  description?: string;
  /** If true, this param is driven by variants and hidden from the UI */
  variantDriven?: boolean;
  /** Show at top level (not in collapsed accordion) */
  common?: boolean;
  /** Theme variable key to resolve default value from (for color/number params) */
  themeVariable?: string;
}

// ─── Variants ─────────────────────────────────────────────────────────

export interface VariantDef {
  name: string;
  label: string;
  /** Parameter overrides for this variant */
  paramOverrides?: Record<string, unknown>;
}

// ─── Render Context ───────────────────────────────────────────────────

export interface RenderUtils {
  text: typeof import('@/core/utils/text');
  shapes: typeof import('@/core/utils/shapes');
  icons: typeof import('@/core/utils/icons');
  colors: typeof import('@/core/utils/colors');
}

export interface RenderContext {
  draw: Container;
  params: Record<string, unknown>;
  theme: ResolvedTheme;
  utils: RenderUtils;
  width: number;
  height: number;
}

// ─── Component Part (for multi-part components like slider) ──────────

export interface ComponentPart {
  id: string;
  name: string;
  render: (ctx: RenderContext) => void;
}

// ─── Component Definition ─────────────────────────────────────────────

export interface ScratchComponentDef {
  id: string;
  name: string;
  category: string;
  params: ComponentParam[];
  variants: VariantDef[];
  iconSlots?: string[];
  render: (ctx: RenderContext) => void;
  /** Multi-part components (each part exports as separate SVG) */
  parts?: ComponentPart[];
}

// ─── Theme ────────────────────────────────────────────────────────────

/**
 * Theme input variables — only base design tokens.
 * Border properties accept shorthand (single value) or per-side / per-corner objects.
 * The ThemeEngine normalizer expands shorthand into the full form.
 */
export interface ThemeVariables {
  primaryColor: string;
  onPrimaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textColorSecondary: string;
  labelColor: string;
  borderColor: string | Sides<string>;
  borderWidth: number | Sides<number>;
  borderRadius: number | Corners<number>;
  disabledOpacity: number;
  fontSize: number;
  fontFamily: string;
  [key: string]: unknown;
}

/**
 * Normalized theme variables — always expanded.
 * This is what components receive via `RenderContext.theme.variables`.
 */
export interface NormalizedThemeVariables {
  primaryColor: string;
  onPrimaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textColorSecondary: string;
  labelColor: string;
  borderColor: Sides<string>;
  borderWidth: Sides<number>;
  borderRadius: Corners<number>;
  disabledOpacity: number;
  fontSize: number;
  fontFamily: string;
  [key: string]: unknown;
}

export interface ThemeComponentOverride {
  render?: (ctx: RenderContext) => void;
  variables?: Partial<ThemeVariables>;
}

export interface Theme {
  id: string;
  name: string;
  variables: ThemeVariables;
  componentOverrides?: Record<string, ThemeComponentOverride>;
}

export interface ResolvedTheme {
  id: string;
  name: string;
  variables: NormalizedThemeVariables;
  renderOverride?: (ctx: RenderContext) => void;
}

// ─── Project Tree ─────────────────────────────────────────────────────

export interface ProjectNode {
  id: string;
  name: string;
  type: 'folder' | 'component';
  parentId: string | null;
  order: number;
  /** Only for type === 'component' */
  componentType?: string;
  paramValues?: Record<string, unknown>;
  themeId?: string;
  selectedVariants?: string[];
}

// ─── Export ───────────────────────────────────────────────────────────

export interface ExportOptions {
  format: 'svg' | 'sprite3' | 'zip';
  nodeIds: string[];
  includeVariants?: boolean;
}
