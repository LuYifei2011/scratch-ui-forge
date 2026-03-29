import { registerAllComponents } from "@/definitions/components";
import { registerAllThemes } from "@/definitions/themes";
import { registerBuiltinIcons } from "@/definitions/icons/builtin";

let initialized = false;

export function initializeApp(): void {
  if (initialized) return;
  registerAllThemes();
  registerBuiltinIcons();
  registerAllComponents();
  initialized = true;
}
