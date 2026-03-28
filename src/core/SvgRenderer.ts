import { SVG, type Container } from '@svgdotjs/svg.js';
import { ComponentRegistry } from './ComponentRegistry';
import { ThemeEngine } from './ThemeEngine';
import type { RenderContext, RenderUtils, ScratchComponentDef } from './types';
import * as textUtils from './utils/text';
import * as shapeUtils from './utils/shapes';
import * as iconUtils from './utils/icons';
import * as colorUtils from './utils/colors';

const utils: RenderUtils = {
  text: textUtils,
  shapes: shapeUtils,
  icons: iconUtils,
  colors: colorUtils,
};

/**
 * Merge default params → user params → variant overrides.
 */
function mergeParams(
  def: ScratchComponentDef,
  params: Record<string, unknown>,
  variantName?: string
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const p of def.params) {
    merged[p.key] = p.defaultValue;
  }
  Object.assign(merged, params);
  if (variantName) {
    const variant = def.variants.find((v) => v.name === variantName);
    if (variant?.paramOverrides) {
      Object.assign(merged, variant.paramOverrides);
    }
  }
  return merged;
}

/**
 * Safety margin (px) added on every side when fitting viewbox to group bbox.
 * SVG stroke is centered on the path outline, so half the stroke-width extends
 * beyond the geometric bbox. 1 px covers typical border widths ≤ 2 px.
 * Increase if thick borders are used.
 */
const STROKE_OVERFLOW_PAD = 1;

/**
 * Resize the canvas viewbox to fit the actual rendered content in `group`.
 *
 * Why group instead of root SVG bbox:
 *   - group.bbox() aggregates child bboxes and is more reliable in headless contexts.
 *
 * Why min(0, box.x) for viewbox origin:
 *   - drawRect insets the path by borderWidth/2 so the centered stroke reaches x=0.
 *   - bbox() returns the path geometry (starting at borderWidth/2), so a naive
 *     viewbox(box.x, …) would clip the outer half of edge strokes.
 *   - Using min(0, box.x) ensures the viewbox always starts at or before x=0.
 */
function fitCanvasToGroup(canvas: Container, group: Container): void {
  const box = group.bbox();
  if (box.width > 0 && box.height > 0) {
    const vx = Math.min(0, box.x) - STROKE_OVERFLOW_PAD;
    const vy = Math.min(0, box.y) - STROKE_OVERFLOW_PAD;
    const vw = (box.x + box.width) - vx + STROKE_OVERFLOW_PAD;
    const vh = (box.y + box.height) - vy + STROKE_OVERFLOW_PAD;
    canvas.size(Math.ceil(vw), Math.ceil(vh)).viewbox(vx, vy, vw, vh);
  }
}

/**
 * Render a component (or a specific part) to an SVG string.
 */
export function renderComponent(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  variantName?: string,
  partId?: string
): string {
  const def = ComponentRegistry.get(componentId);
  if (!def) throw new Error(`Component "${componentId}" not registered`);

  const mergedParams = mergeParams(def, params, variantName);
  const theme = ThemeEngine.resolve(themeId, componentId);

  let renderFn: (ctx: RenderContext) => void;

  if (partId && def.parts) {
    const part = def.parts.find((p) => p.id === partId);
    if (!part) throw new Error(`Part "${partId}" not found in "${componentId}"`);
    renderFn = part.render;
  } else {
    renderFn = theme.renderOverride ?? def.render;
  }

  const canvas = SVG() as Container;
  // All content goes into a group so group.bbox() gives reliable content bounds.
  const group = canvas.group();

  const ctx: RenderContext = {
    draw: group as unknown as Container,
    params: mergedParams,
    theme,
    utils,
    width: 0,
    height: 0,
  };

  renderFn(ctx);
  fitCanvasToGroup(canvas, group as unknown as Container);
  return canvas.svg();
}

/**
 * Render all variants of a component, returning an array of {variantName, svg}.
 */
export function renderAllVariants(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  selectedVariants?: string[]
): { variantName: string; svg: string }[] {
  const def = ComponentRegistry.get(componentId);
  if (!def) throw new Error(`Component "${componentId}" not registered`);

  const variants = selectedVariants
    ? def.variants.filter((v) => selectedVariants.includes(v.name))
    : def.variants;

  return variants.map((v) => ({
    variantName: v.name,
    svg: renderComponent(componentId, params, themeId, v.name),
  }));
}

/**
 * Render all frames: variant × part combinations.
 * For non-part components, returns one frame per variant.
 * For multi-part components, returns variant × part frames.
 */
export function renderAllFrames(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  selectedVariants?: string[]
): { variantName: string; variantLabel: string; partId?: string; partName?: string; svg: string }[] {
  const def = ComponentRegistry.get(componentId);
  if (!def) throw new Error(`Component "${componentId}" not registered`);

  const variants = selectedVariants
    ? def.variants.filter((v) => selectedVariants.includes(v.name))
    : def.variants;

  const results: { variantName: string; variantLabel: string; partId?: string; partName?: string; svg: string }[] = [];

  for (const v of variants) {
    if (def.parts && def.parts.length > 0) {
      for (const part of def.parts) {
        results.push({
          variantName: v.name,
          variantLabel: v.label,
          partId: part.id,
          partName: part.name,
          svg: renderComponent(componentId, params, themeId, v.name, part.id),
        });
      }
    } else {
      results.push({
        variantName: v.name,
        variantLabel: v.label,
        svg: renderComponent(componentId, params, themeId, v.name),
      });
    }
  }

  return results;
}

/**
 * Get the parts definition for a component, or null if single-part.
 */
export function getComponentParts(componentId: string) {
  const def = ComponentRegistry.get(componentId);
  return def?.parts ?? null;
}

/**
 * Render in a real DOM container (for live preview).
 */
export function renderToContainer(
  container: HTMLElement,
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  variantName?: string,
  partId?: string
): void {
  const def = ComponentRegistry.get(componentId);
  if (!def) return;

  container.innerHTML = '';

  const mergedParams = mergeParams(def, params, variantName);
  const theme = ThemeEngine.resolve(themeId, componentId);

  let renderFn: (ctx: RenderContext) => void;

  if (partId && def.parts) {
    const part = def.parts.find((p) => p.id === partId);
    if (!part) return;
    renderFn = part.render;
  } else {
    renderFn = theme.renderOverride ?? def.render;
  }

  const canvas = SVG().addTo(container);
  const group = canvas.group();

  const ctx: RenderContext = {
    draw: group as unknown as Container,
    params: mergedParams,
    theme,
    utils,
    width: 0,
    height: 0,
  };

  renderFn(ctx);
  fitCanvasToGroup(canvas as unknown as Container, group as unknown as Container);
}

/**
 * Render an SVG string onto an HTML <canvas> element.
 *
 * The SVG is loaded as an isolated image blob, which prevents host-page CSS
 * from leaking into the SVG (no inherited font-size, color, etc.).
 * Content is scaled to fit within maxW × maxH while preserving aspect ratio.
 * HiDPI screens are supported via devicePixelRatio.
 */
export function renderSvgToCanvas(
  svgString: string,
  canvas: HTMLCanvasElement,
  maxW: number,
  maxH: number,
  /** When provided, render at naturalSize × zoom (ignores maxW/maxH). */
  zoom?: number,
): Promise<void> {
  const dpr = window.devicePixelRatio || 1;
  return new Promise<void>((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const svgW = img.naturalWidth || maxW || 100;
      const svgH = img.naturalHeight || maxH || 100;
      const scale = zoom != null ? zoom : Math.min(maxW / svgW, maxH / svgH);
      const displayW = Math.max(1, Math.round(svgW * scale));
      const displayH = Math.max(1, Math.round(svgH * scale));
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0, displayW, displayH);
      }
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render SVG to canvas'));
    };
    img.src = url;
  });
}
