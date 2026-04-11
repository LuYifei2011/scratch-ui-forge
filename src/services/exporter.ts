import { saveAs } from "file-saver";
import JSZip from "jszip";
import { md5 } from "js-md5";
import { ThemeRegistry } from "@/core/ThemeRegistry";
import type { CostumeOutput, ProjectNode, ThemeColors } from "@/core/types";
import type { ScratchSpriteScript } from "@/core/scratch-blocks/types";

/**
 * Download costumes as separate SVG files packed in a ZIP.
 */
export async function exportCostumesZip(
  costumes: CostumeOutput[],
  zipName = "costumes.zip"
): Promise<void> {
  const zip = new JSZip();
  for (const costume of costumes) {
    zip.file(`${costume.name}.svg`, costume.svg);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}

/**
 * Batch export multiple nodes as a ZIP.
 */
export async function exportBatchZip(
  nodes: ProjectNode[],
  globalThemeId = "fluent",
  themeColors?: Partial<ThemeColors>,
  zipName = "scratch-ui-forge-export.zip"
): Promise<void> {
  const zip = new JSZip();

  for (const node of nodes) {
    if (node.type !== "component" || !node.componentType) continue;

    const costumes = ThemeRegistry.generateCostumes(
      globalThemeId,
      node.componentType,
      node.paramValues ?? {},
      themeColors
    );

    const folder = zip.folder(node.name) ?? zip;
    for (const costume of costumes) {
      folder.file(`${costume.name}.svg`, costume.svg);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}

/**
 * Export as .sprite3 (Scratch 3 sprite format).
 * When `scripts` is provided the sprite will contain blocks, variables,
 * broadcasts and lists so the component works interactively in Scratch.
 */
export async function exportSprite3(
  costumes: CostumeOutput[],
  spriteName = "sprite",
  scripts?: ScratchSpriteScript,
): Promise<void> {
  const zip = new JSZip();

  const costumeEntries = costumes.map((costume) => {
    const svgBytes = new TextEncoder().encode(costume.svg);
    const hash = md5(svgBytes);
    const fileName = `${hash}.svg`;
    zip.file(fileName, costume.svg);
    return {
      name: costume.name,
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
    name: spriteName,
    variables: scripts?.variables ?? {},
    lists: scripts?.lists ?? {},
    broadcasts: scripts?.broadcasts ?? {},
    blocks: scripts?.blocks ?? {},
    comments: {},
    currentCostume: 0,
    costumes: costumeEntries,
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
  saveAs(blob, `${spriteName}.sprite3`);
}

/**
 * Batch export multiple nodes, each as a separate .sprite3,
 * packed together into one ZIP archive.
 */
export async function exportBatchSprite3(
  nodes: ProjectNode[],
  globalThemeId = "fluent",
  themeColors?: Partial<ThemeColors>,
  zipName = "scratch-ui-forge-sprites.zip",
): Promise<void> {
  const zip = new JSZip();

  for (const node of nodes) {
    if (node.type !== "component" || !node.componentType) continue;

    const costumes = ThemeRegistry.generateCostumes(
      globalThemeId,
      node.componentType,
      node.paramValues ?? {},
      themeColors,
    );
    if (costumes.length === 0) continue;

    const costumeNames = costumes.map((c) => c.name);
    const scripts = ThemeRegistry.generateScripts(
      globalThemeId,
      node.componentType,
      node.name,
      costumeNames,
      node.paramValues ?? {},
    );

    // Build inner sprite zip
    const inner = new JSZip();

    const costumeEntries = costumes.map((costume) => {
      const svgBytes = new TextEncoder().encode(costume.svg);
      const hash = md5(svgBytes);
      inner.file(`${hash}.svg`, costume.svg);
      return {
        name: costume.name,
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
      name: node.name,
      variables: scripts.variables,
      lists: scripts.lists,
      broadcasts: scripts.broadcasts,
      blocks: scripts.blocks,
      comments: {},
      currentCostume: 0,
      costumes: costumeEntries,
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

    inner.file("sprite.json", JSON.stringify(manifest, null, 2));
    const blob = await inner.generateAsync({ type: "blob" });
    zip.file(`${node.name}.sprite3`, blob);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}
