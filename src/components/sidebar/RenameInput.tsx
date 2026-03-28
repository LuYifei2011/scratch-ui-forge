import { Input, Portal, Box } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';

interface RenameInputProps {
  nodeId: string;
  onDone: () => void;
}

export default function RenameInput({ nodeId, onDone }: RenameInputProps) {
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === nodeId));
  const renameNode = useProjectStore((s) => s.renameNode);
  const [name, setName] = useState(node?.name ?? '');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== node?.name) {
      renameNode(nodeId, trimmed);
    }
    onDone();
  };

  return (
    <Portal>
      <Box position="fixed" inset={0} zIndex={999} onClick={onDone}>
        <Input
          ref={ref}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onDone();
          }}
          onBlur={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          size="sm"
          position="fixed"
          w="200px"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="gray.700"
          zIndex={1000}
        />
      </Box>
    </Portal>
  );
}
