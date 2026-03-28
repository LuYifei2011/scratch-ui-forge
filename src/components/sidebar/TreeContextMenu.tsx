import { Box, VStack, Text, Portal } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import RenameInput from './RenameInput';

interface TreeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function TreeContextMenu({ nodeId, x, y, onClose }: TreeContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const removeNode = useProjectStore((s) => s.removeNode);
  const duplicateNode = useProjectStore((s) => s.duplicateNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === nodeId));
  const [showRename, setShowRename] = useState(false);

  const bg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!node) return null;

  if (showRename) {
    return <RenameInput nodeId={nodeId} onDone={() => { setShowRename(false); onClose(); }} />;
  }

  const items = [
    { label: '重命名', action: () => setShowRename(true) },
    ...(node.type === 'component'
      ? [{ label: '复制', action: () => { const newId = duplicateNode(nodeId); if (newId) selectNode(newId); onClose(); } }]
      : []),
    { label: '删除', action: () => { removeNode(nodeId); selectNode(null); onClose(); }, color: 'red.400' },
  ];

  return (
    <Portal>
      <Box
        ref={ref}
        position="fixed"
        left={`${x}px`}
        top={`${y}px`}
        bg={bg}
        borderRadius="md"
        boxShadow="lg"
        py={1}
        minW="120px"
        zIndex={1000}
      >
        <VStack gap={0} align="stretch">
          {items.map((item) => (
            <Text
              key={item.label}
              px={3}
              py={1.5}
              fontSize="sm"
              cursor="pointer"
              color={item.color}
              _hover={{ bg: hoverBg }}
              onClick={item.action}
            >
              {item.label}
            </Text>
          ))}
        </VStack>
      </Box>
    </Portal>
  );
}
