import type { Container, G } from "@svgdotjs/svg.js";

/**
 * Built-in icon path data registry.
 * Keys are icon names, values are SVG path `d` strings designed for a 24x24 viewBox.
 */
const iconPaths: Record<string, string> = {
  checkmark: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
  close:
    "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z",
  "arrow-right": "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z",
  "arrow-left": "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  "arrow-down": "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  minus: "M19 13H5v-2h14v2z",
  search:
    "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  "circle-outline":
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
};

/**
 * Draw an icon from the built-in registry.
 */
export function drawIcon(draw: Container, name: string, x: number, y: number, size: number, fill = "#000"): G {
  const pathData = iconPaths[name];
  const group = draw.group();

  if (pathData) {
    const scale = size / 24;
    group.path(pathData).fill(fill).attr("transform", `scale(${scale})`);
  }

  group.attr("transform", `translate(${x},${y})`);
  return group;
}

/**
 * Get all available icon names.
 */
export function getIconNames(): string[] {
  return Object.keys(iconPaths);
}

/**
 * Get SVG path data for a given icon name.
 */
export function getIconPath(name: string): string | undefined {
  return iconPaths[name];
}

/**
 * Register a new custom icon path.
 */
export function registerIcon(name: string, pathD: string): void {
  iconPaths[name] = pathD;
}
