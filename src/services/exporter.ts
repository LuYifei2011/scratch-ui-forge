import { saveAs } from "file-saver";
import JSZip from "jszip";
import { md5 } from "js-md5";
import { renderComponent, renderAllFrames } from "@/core/SvgRenderer";
import { ComponentRegistry } from "@/core/ComponentRegistry";
import type { ProjectNode } from "@/core/types";

function svgBlob(svgStr: string): Blob {
  return new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
}

/**
 * Download a single SVG file.
 */
export function exportSvg(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  variantName: string,
  fileName?: string
): void {
  const svg = renderComponent(componentId, params, themeId, variantName);
  const name = fileName ?? `${componentId}-${variantName}.svg`;
  saveAs(svgBlob(svg), name);
}

/**
 * Download all variants (and parts) as separate SVG files packed in a ZIP.
 */
export async function exportAllVariantsZip(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  selectedVariants?: string[],
  zipName?: string
): Promise<void> {
  const results = renderAllFrames(componentId, params, themeId, selectedVariants);
  const zip = new JSZip();
  for (const frame of results) {
    const name = frame.partId
      ? `${componentId}-${frame.variantName}-${frame.partId}.svg`
      : `${componentId}-${frame.variantName}.svg`;
    zip.file(name, frame.svg);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName ?? `${componentId}-variants.zip`);
}

/**
 * Batch export multiple nodes as a ZIP.
 */
export async function exportBatchZip(
  nodes: ProjectNode[],
  globalThemeId = "fluent-light",
  zipName = "scratch-ui-forge-export.zip"
): Promise<void> {
  const zip = new JSZip();

  for (const node of nodes) {
    if (node.type !== "component" || !node.componentType) continue;
    const def = ComponentRegistry.get(node.componentType);
    if (!def) continue;

    const params = node.paramValues ?? {};
    const results = renderAllFrames(node.componentType, params, globalThemeId, node.selectedVariants);

    const folder = zip.folder(node.name) ?? zip;
    for (const frame of results) {
      const name = frame.partId ? `${frame.variantName}-${frame.partId}.svg` : `${frame.variantName}.svg`;
      folder.file(name, frame.svg);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}

/**
 * Export as .sprite3 (Scratch 3 sprite format) — placeholder.
 * A .sprite3 is a ZIP file containing:
 * - sprite.json (manifest with costumes array)
 * - SVG files for each costume
 */
export async function exportSprite3(
  componentId: string,
  params: Record<string, unknown>,
  themeId: string,
  selectedVariants?: string[],
  spriteName?: string
): Promise<void> {
  const results = renderAllFrames(componentId, params, themeId, selectedVariants);
  const name = spriteName ?? componentId;
  const zip = new JSZip();

  const costumes = results.map((frame) => {
    const costumeName = frame.partId ? `${frame.variantName}-${frame.partId}` : frame.variantName;
    const svgBytes = new TextEncoder().encode(frame.svg);
    const hash = md5(svgBytes);
    const fileName = `${hash}.svg`;
    zip.file(fileName, frame.svg);
    return {
      name: costumeName,
      bitmapResolution: 1,
      dataFormat: "svg",
      assetId: hash,
      md5ext: `${hash}.svg`,
      rotationCenterX: 0,
      rotationCenterY: 0,
    };
  });

  const manifest = {
    isStage: false,
    name,
    variables: {},
    lists: {},
    broadcasts: {},
    blocks: {},
    comments: {},
    currentCostume: 0,
    costumes,
    sounds: [],
    volume: 100,
    visible: true,
    x: 0,
    y: 0,
    size: 100,
    direction: 90,
    draggable: false,
    rotationStyle: "all around",
  };

  zip.file("sprite.json", JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${name}.sprite3`);
}
