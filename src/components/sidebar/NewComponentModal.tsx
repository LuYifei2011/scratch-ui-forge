import { Button, Input, VStack, Field, Dialog, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import SimpleSelect from "@/components/ui/simple-select";
import { ThemeRegistry } from "@/core/ThemeRegistry";

interface NewComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewComponentModal({ isOpen, onClose }: NewComponentModalProps) {
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const components = ThemeRegistry.getComponentList(globalThemeId);
  const [name, setName] = useState("");
  const [componentType, setComponentType] = useState(components[0]?.key ?? "");
  const addComponent = useProjectStore((s) => s.addComponent);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const nodes = useProjectStore((s) => s.nodes);
  const selectNode = useEditorStore((s) => s.selectNode);

  const getParent = (): string | null => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    if (!node) return null;
    return node.type === "folder" ? node.id : node.parentId;
  };

  const handleCreate = () => {
    const compDef = ThemeRegistry.getComponent(globalThemeId, componentType);
    const finalName = name.trim() || compDef?.name || componentType;
    const newId = addComponent(finalName, getParent(), componentType);
    selectNode(newId);
    setName("");
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      placement="center"
      size="sm"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>新建组件</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <VStack gap={4}>
                <Field.Root>
                  <Field.Label fontSize="sm">组件类型</Field.Label>
                  <SimpleSelect
                    size="sm"
                    value={componentType}
                    onValueChange={setComponentType}
                    options={components.map((c) => ({
                      label: `${c.def.name} (${c.key})`,
                      value: c.key,
                    }))}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm">名称（可选）</Field.Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="留空使用默认名称"
                    size="sm"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button size="sm" variant="ghost" mr={2} onClick={onClose}>
                取消
              </Button>
              <Button size="sm" colorPalette="brand" onClick={handleCreate}>
                创建
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
