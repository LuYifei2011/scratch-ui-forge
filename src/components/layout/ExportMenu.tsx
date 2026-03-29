import { Menu, IconButton, Portal } from "@chakra-ui/react";
import { FiDownload, FiPackage, FiBox, FiFileText } from "react-icons/fi";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import { exportAllVariantsZip, exportBatchZip, exportSprite3 } from "@/services/exporter";
import { renderComponent } from "@/core/SvgRenderer";
import { saveAs } from "file-saver";
import { saveProjectToFile } from "@/services/persistence";
import { Tooltip } from "../ui/tooltip";
import { useId } from "react";

export default function ExportMenu() {
  const triggerId = useId();
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useProjectStore((s) => s.nodes);
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const activeProjectDescription = useProjectStore((s) => s.activeProjectDescription);

  const node = nodes.find((n) => n.id === selectedNodeId);
  const isValidComponentNode = node && node.type === "component" && node.componentType;

  const handleExportSvg = () => {
    if (!isValidComponentNode) return;
    const params = node.paramValues ?? {};
    const variants = node.selectedVariants;
    const variantName = variants?.[0] ?? "default";
    const svg = renderComponent(node.componentType!, params, globalThemeId, variantName);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, `${node.name}-${variantName}.svg`);
  };

  const handleExportZip = async () => {
    if (!isValidComponentNode) return;
    const params = node.paramValues ?? {};
    await exportAllVariantsZip(
      node.componentType!,
      params,
      globalThemeId,
      node.selectedVariants,
      `${node.name}-variants.zip`
    );
  };

  const handleExportSprite3 = async () => {
    if (!isValidComponentNode) return;
    const params = node.paramValues ?? {};
    await exportSprite3(node.componentType!, params, globalThemeId, node.selectedVariants, node.name);
  };

  const handleExportAll = async () => {
    const componentNodes = nodes.filter((n) => n.type === "component");
    await exportBatchZip(componentNodes, globalThemeId);
  };

  const handleSaveFile = async () => {
    await saveProjectToFile(nodes, globalThemeId, activeProjectName, activeProjectDescription);
  };

  return (
    <Menu.Root ids={{ trigger: triggerId }}>
      <Tooltip ids={{ trigger: triggerId }} content="导出">
        <Menu.Trigger asChild>
          <IconButton aria-label="Export Menu" size="sm" variant="ghost">
            <FiDownload />
          </IconButton>
        </Menu.Trigger>
      </Tooltip>
      <Portal>
        <Menu.Positioner zIndex={2000}>
          <Menu.Content
            bg="bg.panel"
            shadow="md"
            border="1px solid"
            borderColor="border.emphasized"
            borderRadius="md"
            py={1}
            minW="160px"
          >
            {isValidComponentNode && (
              <>
                <Menu.Item
                  value="export-svg"
                  onClick={handleExportSvg}
                  cursor="pointer"
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  _hover={{ bg: "bg.muted" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FiDownload /> 导出当前 SVG
                </Menu.Item>
                <Menu.Item
                  value="export-zip"
                  onClick={handleExportZip}
                  cursor="pointer"
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  _hover={{ bg: "bg.muted" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FiPackage /> 导出所有变体 (ZIP)
                </Menu.Item>
                <Menu.Item
                  value="export-sprite"
                  onClick={handleExportSprite3}
                  cursor="pointer"
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  _hover={{ bg: "bg.muted" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <FiBox /> 导出 .sprite3
                </Menu.Item>
                <Menu.Separator my={1} />
              </>
            )}
            <Menu.Item
              value="export-all"
              onClick={handleExportAll}
              cursor="pointer"
              px={3}
              py={1.5}
              fontSize="sm"
              _hover={{ bg: "bg.muted" }}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <FiPackage /> 批量导出全部组件
            </Menu.Item>
            <Menu.Item
              value="save-file"
              onClick={handleSaveFile}
              cursor="pointer"
              px={3}
              py={1.5}
              fontSize="sm"
              _hover={{ bg: "bg.muted" }}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <FiFileText /> 保存到文件 (JSON)
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
