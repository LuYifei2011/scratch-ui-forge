import { SVG, type Container } from "@svgdotjs/svg.js";
import type { DrawFn } from "./types";
import sansSerifUrl from "scratch-render-fonts/src/NotoSans-Medium.ttf?url";
import serifUrl from "scratch-render-fonts/src/SourceSerifPro-Regular.otf?url";
import handwritingUrl from "scratch-render-fonts/src/handlee-regular.ttf?url";
import markerUrl from "scratch-render-fonts/src/Knewave.ttf?url";
import curlyUrl from "scratch-render-fonts/src/Griffy-Regular.ttf?url";
import pixelUrl from "scratch-render-fonts/src/Grand9K-Pixel.ttf?url";
import scratchUrl from "scratch-render-fonts/src/Scratch.ttf?url";

/**
 * Safety margin (px) added on every side when fitting viewbox to group bbox.
 * SVG stroke is centered on the path outline, so half the stroke-width extends
 * beyond the geometric bbox. 1 px covers typical border widths ≤ 2 px.
 * Increase if thick borders are used.
 */
const STROKE_OVERFLOW_PAD = 1;

/**
 * Resize the canvas viewbox to fit the actual rendered content in `group`.
 */
function fitCanvasToGroup(canvas: Container, group: Container): void {
  const box = group.bbox();
  if (box.width > 0 && box.height > 0) {
    const vx = Math.min(0, box.x) - STROKE_OVERFLOW_PAD;
    const vy = Math.min(0, box.y) - STROKE_OVERFLOW_PAD;
    const vw = box.x + box.width - vx + STROKE_OVERFLOW_PAD;
    const vh = box.y + box.height - vy + STROKE_OVERFLOW_PAD;
    canvas.size(Math.ceil(vw), Math.ceil(vh)).viewbox(vx, vy, vw, vh);
  }
}

// ─── Core render helper ───────────────────────────────────────────────

/**
 * Execute a draw function inside a headless SVG canvas and return the SVG string.
 * This is the central rendering primitive used by theme `generateCostumes`.
 */
export function renderToSvg(fn: DrawFn): string {
  const canvas = SVG() as Container;
  const group = canvas.group();
  fn(group as unknown as Container);
  fitCanvasToGroup(canvas, group as unknown as Container);
  return canvas.svg();
}

/**
 * Render a draw function into a DOM container (for live preview).
 */
export function renderToContainer(container: HTMLElement, fn: DrawFn): void {
  container.innerHTML = "";
  const canvas = SVG().addTo(container);
  const group = canvas.group();
  fn(group as unknown as Container);
  fitCanvasToGroup(canvas as unknown as Container, group as unknown as Container);
}

// ── Embedded-font support ─────────────────────────────────────────────────────
// When an SVG is rendered via a Blob URL and drawn with drawImage(), the
// browser's SVG renderer runs isolated from the host document, so @font-face
// rules registered in document <style> tags are invisible to it.  The only
// reliable fix is to embed @font-face declarations with base64-encoded font
// data directly inside the SVG's own <style> element.

const FONT_DEFS = [
  { family: "Sans Serif", url: sansSerifUrl, format: "truetype" },
  { family: "Serif", url: serifUrl, format: "opentype" },
  { family: "Handwriting", url: handwritingUrl, format: "truetype" },
  { family: "Marker", url: markerUrl, format: "truetype" },
  { family: "Curly", url: curlyUrl, format: "truetype" },
  { family: "Pixel", url: pixelUrl, format: "truetype" },
  { family: "Scratch", url: scratchUrl, format: "truetype" },
] as const;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let cachedFontStyleBlock: Promise<string> | null = null;

function getSvgFontStyleBlock(): Promise<string> {
  if (!cachedFontStyleBlock) {
    cachedFontStyleBlock = Promise.all(
      FONT_DEFS.map(async (f): Promise<string> => {
        try {
          const resp = await fetch(f.url);
          const buf = await resp.arrayBuffer();
          const b64 = arrayBufferToBase64(buf);
          const mime = f.format === "opentype" ? "font/otf" : "font/ttf";
          return `@font-face{font-family:'${f.family}';src:url('data:${mime};base64,${b64}') format('${f.format}');}`;
        } catch {
          return ""; // skip fonts that fail to load
        }
      })
    ).then((rules) => `<style>${rules.join("")}</style>`);
  }
  return cachedFontStyleBlock;
}

/** Inject an embedded-font <style> block as the first child of the <svg> root. */
function injectFontsIntoSvg(svgString: string, styleBlock: string): string {
  return svgString.replace(/<svg([^>]*)>/, `<svg$1>${styleBlock}`);
}

/**
 * Render an SVG string onto an HTML <canvas> element.
 *
 * The SVG is loaded as an isolated image blob, which prevents host-page CSS
 * from leaking into the SVG (no inherited font-size, color, etc.).
 * Content is scaled to fit within maxW × maxH while preserving aspect ratio.
 * HiDPI screens are supported via devicePixelRatio.
 *
 * Custom fonts are embedded as base64 data URIs so they remain available
 * inside the isolated blob context.
 */
export function renderSvgToCanvas(
  svgString: string,
  canvas: HTMLCanvasElement,
  maxW: number,
  maxH: number,
  /** When provided, render at naturalSize × zoom (ignores maxW/maxH). */
  zoom?: number
): Promise<void> {
  const dpr = window.devicePixelRatio || 1;
  return getSvgFontStyleBlock().then(
    (styleBlock) =>
      new Promise<void>((resolve, reject) => {
        const svgWithFonts = injectFontsIntoSvg(svgString, styleBlock);
        const blob = new Blob([svgWithFonts], { type: "image/svg+xml;charset=utf-8" });
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
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.drawImage(img, 0, 0, displayW, displayH);
          }
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to render SVG to canvas"));
        };
        img.src = url;
      })
  );
}
