export { fluentTheme } from "./fluent";
export { minecraftTheme } from "./minecraft";

import type { ThemeDef } from "@/core/types";
import { fluentTheme } from "./fluent";
import { minecraftTheme } from "./minecraft";

/** All built-in themes */
export const builtinThemes: ThemeDef[] = [
  fluentTheme,
  minecraftTheme,
];
