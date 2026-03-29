import { Box, Flex, Text, Icon, Input } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { FiFolder, FiChevronRight, FiChevronDown } from "react-icons/fi";
import { MdWidgets } from "react-icons/md";
import { useState, useCallback, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import TreeContextMenu from "./TreeContextMenu";

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
  const moveNode = useProjectStore((s) => s.moveNode);
  const renameNode = useProjectStore((s) => s.renameNode);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);

  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Drag and drop state
  const [dragState, setDragState] = useState<"top" | "bottom" | "inside" | null>(null);

  // Inline edit state
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node?.name ?? "");

  const startRenaming = () => {
    if (node) {
      setRenameValue(node.name);
      setIsRenaming(true);
    }
  };

  const handleRenameSave = () => {
    const trimmed = renameValue.trim();
    if (trimmed && node && trimmed !== node.name) {
      renameNode(nodeId, trimmed);
    } else if (node) {
      setRenameValue(node.name); // revert if empty
    }
    setIsRenaming(false);
  };

  const isSelected = selectedNodeId === nodeId;
  const selectedBg = useColorModeValue("brand.50", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.50");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputColor = useColorModeValue("black", "white");

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  if (!node) return null;

  const isFolder = node.type === "folder";

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/node-id", nodeId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;

    if (y < h * 0.25) {
      setDragState("top");
    } else if (y > h * 0.75) {
      setDragState("bottom");
    } else {
      setDragState(isFolder ? "inside" : "bottom");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragState(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(null);

    const draggedId = e.dataTransfer.getData("application/node-id");
    if (!draggedId || draggedId === nodeId) return;

    if (dragState === "inside") {
      moveNode(draggedId, nodeId);
      setExpanded(true);
    } else {
      moveNode(draggedId, node.parentId, nodeId, dragState);
    }
  };

  return (
    <Box>
      <Flex
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        align="center"
        px={2}
        py="3px"
        pl={`${depth * 16 + 8}px`}
        cursor="pointer"
        position="relative"
        borderRadius="md"
        _hover={{ bg: isSelected ? selectedBg : hoverBg }}
        onClick={() => {
          selectNode(nodeId);
          if (isFolder) setExpanded((e) => !e);
        }}
        onContextMenu={handleContextMenu}
        userSelect="none"
        fontSize="sm"
        borderTop={dragState === "top" ? "2px solid" : "none"}
        borderTopColor="blue.400"
        borderBottom={dragState === "bottom" ? "2px solid" : "none"}
        borderBottomColor="blue.400"
        bg={dragState === "inside" ? "blue.500" : isSelected ? selectedBg : "transparent"}
        opacity={dragState === "inside" ? 0.8 : 1}
      >
        {isFolder && <Icon as={expanded ? FiChevronDown : FiChevronRight} mr={1} boxSize={3} color="gray.500" />}
        <Icon as={isFolder ? FiFolder : MdWidgets} mr={2} boxSize={3.5} color={isFolder ? "yellow.400" : "brand.400"} />
        {isRenaming ? (
          <Box flex={1} mr={2} onClick={(e) => e.stopPropagation()}>
            <Input
              autoFocus
              variant="flushed"
              size="xs"
              h="22px"
              px={1}
              borderRadius="sm"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSave();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  if (node) setRenameValue(node.name);
                }
              }}
              onBlur={handleRenameSave}
              bg={inputBg}
              color={inputColor}
            />
          </Box>
        ) : (
          <Text fontSize="sm" lineClamp={1} flex={1}>
            {node.name}
          </Text>
        )}
        {!isFolder && !isRenaming && node.componentType && (
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
          onRename={startRenaming}
        />
      )}
    </Box>
  );
}
