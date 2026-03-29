import { ThemeEngine } from "@/core/ThemeEngine";
import { fluentDarkTheme } from "./fluent_dark";
import { fluentLightTheme } from "./fluent_light";
import { gameTheme } from "./game";

export function registerAllThemes(): void {
  ThemeEngine.register(fluentDarkTheme);
  ThemeEngine.register(fluentLightTheme);
  ThemeEngine.register(gameTheme);
}
