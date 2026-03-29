import type { Theme, ResolvedTheme, ThemeVariables, NormalizedThemeVariables } from "./types";
import { normalizeSides, normalizeCorners } from "./types";

class ThemeEngineImpl {
  private themes = new Map<string, Theme>();

  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  get(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  list(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Resolve a theme for a specific component: merge base variables with any
   * component-level variable overrides, normalize shorthand, and attach
   * render override if present.
   */
  resolve(themeId: string, componentId?: string): ResolvedTheme {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme "${themeId}" not found`);
    }

    let variables: ThemeVariables = { ...theme.variables };
    let renderOverride: ((ctx: import("./types").RenderContext) => void) | undefined;

    if (componentId && theme.componentOverrides?.[componentId]) {
      const override = theme.componentOverrides[componentId];
      if (override.variables) {
        variables = { ...variables, ...override.variables } as ThemeVariables;
      }
      renderOverride = override.render;
    }

    // Resolve variable references (e.g., "$primaryColor" → actual value)
    variables = this.resolveVariableReferences(variables);

    // Normalize shorthand border values into expanded form
    const normalized = this.normalizeVariables(variables);

    return {
      id: theme.id,
      name: theme.name,
      variables: normalized,
      renderOverride,
    };
  }

  /**
   * Expand shorthand border/radius values into per-side / per-corner objects.
   */
  private normalizeVariables(vars: ThemeVariables): NormalizedThemeVariables {
    const { borderColor, borderWidth, borderRadius, ...rest } = vars;
    return {
      ...rest,
      borderColor: normalizeSides(borderColor),
      borderWidth: normalizeSides(borderWidth),
      borderRadius: normalizeCorners(borderRadius),
    } as NormalizedThemeVariables;
  }

  private resolveVariableReferences(vars: ThemeVariables): ThemeVariables {
    const resolved = { ...vars };
    const maxDepth = 5;

    for (const key of Object.keys(resolved)) {
      let val = resolved[key];
      let depth = 0;
      while (typeof val === "string" && val.startsWith("$") && depth < maxDepth) {
        const refKey = val.slice(1);
        if (refKey in resolved) {
          val = resolved[refKey];
          resolved[key] = val;
        } else {
          break;
        }
        depth++;
      }
    }

    return resolved;
  }
}

export const ThemeEngine = new ThemeEngineImpl();
