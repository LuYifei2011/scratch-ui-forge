import { Box, HStack, Text, IconButton } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { FiPlus, FiFolderPlus } from "react-icons/fi";
import FileTree from "./FileTree";
import NewComponentModal from "./NewComponentModal";
import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";

export default function Sidebar() {
  const [isModalOpen, setModalOpen] = useState(false);
  const addFolder = useProjectStore((s) => s.addFolder);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useProjectStore((s) => s.nodes);

  // Determine which parent to add into
  const getSelectedParent = (): string | null => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    return node.type === "folder" ? node.id : node.parentId;
  };

  const handleAddFolder = () => {
    const parentId = getSelectedParent();
    addFolder("新建文件夹", parentId);
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("application/node-id");
    if (!draggedId) return;
    useProjectStore.getState().moveNode(draggedId, null);
  };

  return (
    <Box h="100%" bg="bg.muted" display="flex" flexDirection="column">
      <HStack px={3} py={2} justify="space-between" borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
          项目
        </Text>
        <HStack gap={0}>
          <Tooltip content="新建文件夹">
            <IconButton aria-label="New folder" size="xs" variant="ghost" onClick={handleAddFolder}>
              <FiFolderPlus />
            </IconButton>
          </Tooltip>
          <Tooltip content="新建组件">
            <IconButton aria-label="New component" size="xs" variant="ghost" onClick={() => setModalOpen(true)}>
              <FiPlus />
            </IconButton>
          </Tooltip>
        </HStack>
      </HStack>
      <Box flex={1} overflow="auto" px={1} py={1} onDragOver={handleRootDragOver} onDrop={handleRootDrop}>
        <FileTree parentId={null} depth={0} />
      </Box>
      <NewComponentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
