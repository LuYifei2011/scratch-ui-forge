export { fluentDarkTheme } from "./fluent_dark";
export { fluentLightTheme } from "./fluent_light";
export { minecraftTheme } from "./minecraft";

import type { ThemeDef } from "@/core/types";
import { fluentDarkTheme } from "./fluent_dark";
import { fluentLightTheme } from "./fluent_light";
import { minecraftTheme } from "./minecraft";

/** All built-in themes */
export const builtinThemes: ThemeDef[] = [
  fluentDarkTheme,
  fluentLightTheme,
  minecraftTheme,
];
