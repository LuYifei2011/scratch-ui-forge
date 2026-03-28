import { Box, VStack, Button, Text, Separator } from '@chakra-ui/react';
import { FiDownload, FiPackage, FiBox } from 'react-icons/fi';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import { exportAllVariantsZip, exportBatchZip, exportSprite3 } from '@/services/exporter';
import { renderComponent } from '@/core/SvgRenderer';
import { saveAs } from 'file-saver';

export default function ExportPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const nodes = useProjectStore((s) => s.nodes);
  const globalThemeId = useProjectStore((s) => s.globalThemeId);

  if (!node || node.type !== 'component' || !node.componentType) {
    return null;
  }

  const params = node.paramValues ?? {};
  const themeId = globalThemeId;

  const handleExportSvg = () => {
    // Export first selected variant as single SVG
    const variants = node.selectedVariants;
    const variantName = variants?.[0] ?? 'default';
    const svg = renderComponent(node.componentType!, params, themeId, variantName);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    saveAs(blob, `${node.name}-${variantName}.svg`);
  };

  const handleExportZip = async () => {
    await exportAllVariantsZip(
      node.componentType!,
      params,
      themeId,
      node.selectedVariants,
      `${node.name}-variants.zip`
    );
  };

  const handleExportSprite3 = async () => {
    await exportSprite3(
      node.componentType!,
      params,
      themeId,
      node.selectedVariants,
      node.name
    );
  };

  const handleExportAll = async () => {
    const componentNodes = nodes.filter((n) => n.type === 'component');
    await exportBatchZip(componentNodes, globalThemeId);
  };

  return (
    <Box px={3} py={2} borderTop="1px solid" borderColor="border.emphasized">
      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
        导出
      </Text>
      <VStack gap={2} align="stretch">
        <Button size="sm" variant="outline" onClick={handleExportSvg}><FiDownload />导出当前 SVG
                  </Button>
        <Button size="sm" variant="outline" onClick={handleExportZip}><FiPackage />导出所有变体 (ZIP)
                  </Button>
        <Button size="sm" variant="outline" onClick={handleExportSprite3}><FiBox />导出 .sprite3
                  </Button>
        <Separator />
        <Button size="xs" variant="ghost" onClick={handleExportAll}>
          批量导出全部组件
        </Button>
      </VStack>
    </Box>
  );
}
