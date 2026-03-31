import type { Container } from "@svgdotjs/svg.js";

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
  if (input !== null && typeof input === "object" && "top" in (input as object)) {
    return input as Sides<T>;
  }
  return sidesOf(input as T);
}

/** Normalize shorthand → Corners. If already a Corners object, return as-is. */
export function normalizeCorners<T>(input: T | Corners<T>): Corners<T> {
  if (input !== null && typeof input === "object" && "topLeft" in (input as object)) {
    return input as Corners<T>;
  }
  return cornersOf(input as T);
}

// ─── Theme Parameter Declaration ─────────────────────────────────────

export type ParamType = "number" | "string" | "color" | "boolean" | "select" | "slider" | "icon";

export interface ParamConstraints {
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
}

/**
 * A parameter declared by a theme for a component.
 * Replaces the old `ComponentParam` + `VariantDef` — everything is a flat param.
 */
export interface ThemeParam {
  key: string;
  label: string;
  type: ParamType;
  defaultValue: unknown;
  group?: string;
  constraints?: ParamConstraints;
  description?: string;
  /** Show at top level (not in collapsed accordion) */
  common?: boolean;
}

// ─── Theme Color Declaration ─────────────────────────────────────────

/** Declares one user-editable color slot in a theme. */
export interface ThemeColorDef {
  key: string;
  label: string;
  defaultValue: string;
}

/** Runtime color values keyed by slot key. */
export type ThemeColors = Record<string, string>;

// ─── Costume Output ──────────────────────────────────────────────────

/** A single rendered costume (SVG image with a name). */
export interface CostumeOutput {
  /** Name used in UI display and file export */
  name: string;
  /** Rendered SVG string */
  svg: string;
}

// ─── Theme Component Definition ──────────────────────────────────────

/**
 * Defines how a theme provides a specific component.
 * The theme owns parameters, rendering logic, and costume generation.
 */
export interface ThemeComponentDef {
  /** Display name (e.g., "按钮") */
  name: string;
  /** Category for grouping (e.g., "基础") */
  category?: string;
  /** Icon slot param keys (for icon picker UI) */
  iconSlots?: string[];
  /** All user-editable parameters for this component in this theme */
  params: ThemeParam[];
  /**
   * Generate all costumes for this component.
   * Receives the resolved theme colors and user-edited parameters.
   * Returns an array of named SVG costumes.
   */
  generateCostumes: (colors: ThemeColors, params: Record<string, unknown>) => CostumeOutput[];
}

// ─── Theme Definition ────────────────────────────────────────────────

/**
 * Top-level theme definition. Themes are the central orchestrators:
 * they declare colors, list supported components, define parameters, and
 * connect everything to component render functions.
 */
export interface ThemeDef {
  id: string;
  name: string;
  /** Color slots that users can customize in the UI */
  colorDefs: ThemeColorDef[];
  /** Default color values for all slots */
  defaultColors: ThemeColors;
  /** Components supported by this theme (keyed by component key, e.g., "button") */
  components: Record<string, ThemeComponentDef>;
}

// ─── Render Helper ───────────────────────────────────────────────────

/**
 * Callback that draws SVG content into a container.
 * Used by `renderToSvg()` to wrap drawing logic.
 */
export type DrawFn = (draw: Container) => void;

// ─── Project Tree ─────────────────────────────────────────────────────

export interface ProjectNode {
  id: string;
  name: string;
  type: "folder" | "component";
  parentId: string | null;
  order: number;
  /** Component key within the current theme (e.g., "button") */
  componentType?: string;
  /** User-edited parameter values */
  paramValues?: Record<string, unknown>;
}

// ─── Export ───────────────────────────────────────────────────────────

export interface ExportOptions {
  format: "svg" | "sprite3" | "zip";
  nodeIds: string[];
}
