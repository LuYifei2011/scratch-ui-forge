import {
  VStack,
  Input,
  Textarea,
  Button,
  Dialog,
  Portal,
  Field,
  Text,
  Separator,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useEditorStore } from '@/store/editorStore';
import { ThemeEngine } from '@/core/ThemeEngine';
import SimpleSelect from '@/components/ui/simple-select';

const DEFAULT_THEME_ID = 'fluent-light';

interface ProjectSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
}

interface ProjectSettingsFormProps {
  mode: 'create' | 'edit';
  initialName: string;
  initialDescription: string;
  initialThemeId: string;
  onCancel: () => void;
  onSave: (name: string, description: string, themeId: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function ProjectSettingsForm({
  mode,
  initialName,
  initialDescription,
  initialThemeId,
  onCancel,
  onSave,
  onDelete,
}: ProjectSettingsFormProps) {
  const themes = ThemeEngine.list();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [themeId, setThemeId] = useState(initialThemeId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    await onSave(name.trim() || '未命名项目', description.trim(), themeId);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete();
  };

  return (
    <>
      <Dialog.Body>
        <VStack gap={4}>
          <Field.Root>
            <Field.Label fontSize="sm">项目名称</Field.Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="我的项目"
              size="sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label fontSize="sm">描述</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="项目描述（可选）"
              size="sm"
              rows={2}
              resize="vertical"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label fontSize="sm">主题</Field.Label>
            <SimpleSelect
              size="sm"
              value={themeId}
              onValueChange={setThemeId}
              options={themes.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Field.Root>

          {mode === 'edit' && onDelete && (
            <>
              <Separator />
              <Button
                size="sm"
                variant={confirmDelete ? 'solid' : 'outline'}
                colorPalette="red"
                w="100%"
                onClick={handleDelete}
              >
                {confirmDelete ? '确认删除此项目' : '删除项目'}
              </Button>
              {confirmDelete && (
                <Text fontSize="xs" color="fg.muted">
                  点击上方按钮确认删除，此操作不可撤销。
                </Text>
              )}
            </>
          )}
        </VStack>
      </Dialog.Body>
      <Dialog.Footer>
        <Button size="sm" variant="ghost" mr={2} onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" colorPalette="brand" onClick={handleSave}>
          {mode === 'create' ? '创建' : '保存'}
        </Button>
      </Dialog.Footer>
    </>
  );
}

export default function ProjectSettingsDialog({ open, onClose, mode }: ProjectSettingsDialogProps) {
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const activeProjectDescription = useProjectStore((s) => s.activeProjectDescription);
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const setGlobalThemeId = useProjectStore((s) => s.setGlobalThemeId);
  const updateActiveProjectMeta = useProjectStore((s) => s.updateActiveProjectMeta);
  const createProject = useProjectStore((s) => s.createProject);
  const openProject = useProjectStore((s) => s.openProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);

  const formKey = mode === 'edit'
    ? `edit:${activeProjectId}:${activeProjectName}:${activeProjectDescription}:${globalThemeId}`
    : 'create';

  const handleSave = async (name: string, description: string, themeId: string) => {
    if (mode === 'create') {
      const id = await createProject(name || '新项目', description, themeId);
      onClose();
      await openProject(id);
      return;
    }

    updateActiveProjectMeta(name || '未命名项目', description);
    if (themeId !== globalThemeId) {
      setGlobalThemeId(themeId);
      triggerRefresh();
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!activeProjectId) return;
    await deleteProject(activeProjectId);
    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      placement="center"
      size="sm"
      onOpenChange={(e) => { if (!e.open) onClose(); }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{mode === 'create' ? '新建项目' : '项目设置'}</Dialog.Header>
            <Dialog.CloseTrigger />
            {open && (
              <ProjectSettingsForm
                key={formKey}
                mode={mode}
                initialName={mode === 'edit' ? activeProjectName : ''}
                initialDescription={mode === 'edit' ? activeProjectDescription : ''}
                initialThemeId={mode === 'edit' ? globalThemeId : DEFAULT_THEME_ID}
                onCancel={onClose}
                onSave={handleSave}
                onDelete={mode === 'edit' ? handleDelete : undefined}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
