import { ComponentRegistry } from "@/core/ComponentRegistry";
import buttonDef from "./ButtonComponent";
import checkboxDef from "./CheckboxComponent";
import toggleDef from "./ToggleComponent";
import sliderDef from "./SliderComponent";

export function registerAllComponents(): void {
  ComponentRegistry.register(buttonDef);
  ComponentRegistry.register(checkboxDef);
  ComponentRegistry.register(toggleDef);
  ComponentRegistry.register(sliderDef);
}
