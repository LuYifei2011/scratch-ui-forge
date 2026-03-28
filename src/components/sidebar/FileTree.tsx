import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { MdWidgets } from 'react-icons/md';
import { useState, useCallback, useMemo } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import TreeContextMenu from './TreeContextMenu';

interface FileTreeProps {
  parentId: string | null;
  depth: number;
}

export default function FileTree({ parentId, depth }: FileTreeProps) {
  const allNodes = useProjectStore((s) => s.nodes);
  const nodes = useMemo(
    () => allNodes.filter((n) => n.parentId === parentId).sort((a, b) => a.order - b.order),
    [allNodes, parentId]
  );

  if (nodes.length === 0 && depth === 0) {
    return (
      <Text fontSize="xs" color="gray.500" textAlign="center" py={8}>
        暂无组件，点击上方 + 创建
      </Text>
    );
  }

  return (
    <>
      {nodes.map((node) => (
        <TreeNode key={node.id} nodeId={node.id} depth={depth} />
      ))}
    </>
  );
}

function TreeNode({ nodeId, depth }: { nodeId: string; depth: number }) {
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === nodeId));
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const isSelected = selectedNodeId === nodeId;
  const selectedBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.50');

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    []
  );

  if (!node) return null;

  const isFolder = node.type === 'folder';

  return (
    <Box>
      <Flex
        align="center"
        px={2}
        py="3px"
        pl={`${depth * 16 + 8}px`}
        cursor="pointer"
        borderRadius="md"
        bg={isSelected ? selectedBg : 'transparent'}
        _hover={{ bg: isSelected ? selectedBg : hoverBg }}
        onClick={() => {
          selectNode(nodeId);
          if (isFolder) setExpanded((e) => !e);
        }}
        onContextMenu={handleContextMenu}
        userSelect="none"
        fontSize="sm"
      >
        {isFolder && (
          <Icon
            as={expanded ? FiChevronDown : FiChevronRight}
            mr={1}
            boxSize={3}
            color="gray.500"
          />
        )}
        <Icon
          as={isFolder ? FiFolder : MdWidgets}
          mr={2}
          boxSize={3.5}
          color={isFolder ? 'yellow.400' : 'brand.400'}
        />
        <Text fontSize="sm" lineClamp={1} flex={1}>
          {node.name}
        </Text>
        {!isFolder && node.componentType && (
          <Text fontSize="2xs" color="gray.500" ml={1}>
            {node.componentType}
          </Text>
        )}
      </Flex>
      {isFolder && expanded && <FileTree parentId={nodeId} depth={depth + 1} />}
      {contextMenu && (
        <TreeContextMenu
          nodeId={nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </Box>
  );
}
