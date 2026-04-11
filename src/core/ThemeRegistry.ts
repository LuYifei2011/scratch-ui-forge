import type { ThemeDef, ThemeComponentDef, ThemeColors, CostumeOutput } from "./types";
import type { ScratchSpriteScript } from "./scratch-blocks/types";
import { emptySpriteScript } from "./scratch-blocks/types";

class ThemeRegistryImpl {
  private themes = new Map<string, ThemeDef>();

  register(theme: ThemeDef): void {
    this.themes.set(theme.id, theme);
  }

  get(id: string): ThemeDef | undefined {
    return this.themes.get(id);
  }

  list(): ThemeDef[] {
    return Array.from(this.themes.values());
  }

  /** Get a specific component definition within a theme. */
  getComponent(themeId: string, componentKey: string): ThemeComponentDef | undefined {
    return this.themes.get(themeId)?.components[componentKey];
  }

  /** List all component keys available in a theme. */
  getComponentKeys(themeId: string): string[] {
    const theme = this.themes.get(themeId);
    return theme ? Object.keys(theme.components) : [];
  }

  /** List component definitions for a theme (with their keys). */
  getComponentList(themeId: string): { key: string; def: ThemeComponentDef }[] {
    const theme = this.themes.get(themeId);
    if (!theme) return [];
    return Object.entries(theme.components).map(([key, def]) => ({ key, def }));
  }

  /** Resolve colors: merge theme defaults with user overrides. */
  resolveColors(themeId: string, overrides?: Partial<ThemeColors>): ThemeColors {
    const theme = this.themes.get(themeId);
    if (!theme) return {};
    return { ...theme.defaultColors, ...overrides } as ThemeColors;
  }

  /**
   * Generate costumes for a component using the theme's logic.
   * @param themeId   The theme to use
   * @param componentKey  The component key (e.g., "button")
   * @param params    User-edited parameter values
   * @param colorOverrides  User-edited color overrides
   */
  generateCostumes(
    themeId: string,
    componentKey: string,
    params: Record<string, unknown>,
    colorOverrides?: Partial<ThemeColors>
  ): CostumeOutput[] {
    const compDef = this.getComponent(themeId, componentKey);
    if (!compDef) return [];

    const colors = this.resolveColors(themeId, colorOverrides);

    // Merge default param values with user values
    const mergedParams: Record<string, unknown> = {};
    for (const p of compDef.params) {
      mergedParams[p.key] = p.defaultValue;
    }
    Object.assign(mergedParams, params);

    return compDef.generateCostumes(colors, mergedParams);
  }

  /**
   * Generate Scratch scripts for a component.
   * @param themeId       The theme to use
   * @param componentKey  The component key (e.g., "button")
   * @param spriteName    Name of the sprite being exported
   * @param costumeNames  Names of the costumes that were generated
   * @param params        User-edited parameter values
   */
  generateScripts(
    themeId: string,
    componentKey: string,
    spriteName: string,
    costumeNames: string[],
    params: Record<string, unknown>,
  ): ScratchSpriteScript {
    const compDef = this.getComponent(themeId, componentKey);
    if (!compDef?.generateScripts) return emptySpriteScript();

    const mergedParams: Record<string, unknown> = {};
    for (const p of compDef.params) {
      mergedParams[p.key] = p.defaultValue;
    }
    Object.assign(mergedParams, params);

    return compDef.generateScripts(spriteName, costumeNames, mergedParams);
  }
}

export const ThemeRegistry = new ThemeRegistryImpl();
