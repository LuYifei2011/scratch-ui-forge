import { ThemeRegistry } from "@/core/ThemeRegistry";
import { builtinThemes } from "@/definitions/themes";
import { registerBuiltinIcons } from "@/definitions/icons/builtin";

let initialized = false;

export function initializeApp(): void {
  if (initialized) return;
  for (const theme of builtinThemes) {
    ThemeRegistry.register(theme);
  }
  registerBuiltinIcons();
  initialized = true;
}
