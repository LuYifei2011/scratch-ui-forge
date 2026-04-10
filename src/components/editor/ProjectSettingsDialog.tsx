import {
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  Dialog,
  Portal,
  Field,
  Text,
  Separator,
  Accordion,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import { ThemeRegistry } from "@/core/ThemeRegistry";
import SimpleSelect from "@/components/ui/simple-select";
import type { ThemeColors, ThemeColorDef } from "@/core/types";

const DEFAULT_THEME_ID = "fluent";

interface ProjectSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

interface ProjectSettingsFormProps {
  mode: "create" | "edit";
  initialName: string;
  initialDescription: string;
  initialThemeId: string;
  initialThemeColors: Partial<ThemeColors>;
  onCancel: () => void;
  onSave: (name: string, description: string, themeId: string, colors: Partial<ThemeColors>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

// ─── Color Row ────────────────────────────────────────────────────────────────

interface ColorRowProps {
  def: ThemeColorDef;
  value: string;
  onChange: (value: string) => void;
}

function ColorRow({ def, value, onChange }: ColorRowProps) {
  return (
    <HStack justify="space-between" gap={2}>
      <Tooltip content={def.label} disabled={def.label.length <= 6}>
        <Text fontSize="xs" color="fg.subtle" flex={1} minW={0} truncate>
          {def.label}
        </Text>
      </Tooltip>
      <HStack gap={1} flexShrink={0}>
        <Input
          type="color"
          w="24px"
          h="24px"
          p={0}
          border="none"
          borderRadius="sm"
          cursor="pointer"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          size="xs"
          w="80px"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          fontFamily="mono"
          fontSize="xs"
        />
      </HStack>
    </HStack>
  );
}

// ─── Settings Form ────────────────────────────────────────────────────────────

function ProjectSettingsForm({
  mode,
  initialName,
  initialDescription,
  initialThemeId,
  initialThemeColors,
  onCancel,
  onSave,
  onDelete,
}: ProjectSettingsFormProps) {
  const themes = ThemeRegistry.list();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [themeId, setThemeId] = useState(initialThemeId);
  const [localColors, setLocalColors] = useState<Partial<ThemeColors>>(initialThemeColors);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const theme = ThemeRegistry.get(themeId);
  const resolvedColors = ThemeRegistry.resolveColors(themeId, localColors);

  const handleThemeChange = (id: string) => {
    setThemeId(id);
    // Reset color overrides when switching themes
    setLocalColors({});
  };

  const applyPreset = (presetId: string) => {
    const preset = theme?.colorPresets?.find((p) => p.id === presetId);
    if (!preset) return;
    setLocalColors({ ...preset.colors });
  };

  const setColor = (key: string, value: string) => {
    setLocalColors((prev) => ({ ...prev, [key]: value }));
  };

  const resetColors = () => setLocalColors({});

  const handleSave = async () => {
    await onSave(name.trim() || "未命名项目", description.trim(), themeId, localColors);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete();
  };

  const brandDef = theme?.brandColorKey
    ? theme.colorDefs.find((d) => d.key === theme.brandColorKey)
    : null;
  const otherDefs = theme?.colorDefs.filter((d) => d.key !== theme.brandColorKey) ?? [];

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
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
              onValueChange={handleThemeChange}
              options={themes.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Field.Root>

          {/* ── Theme color customization ── */}
          {theme && (
            <Field.Root>
              <HStack justify="space-between" w="100%" mb={1}>
                <Field.Label fontSize="sm" mb={0}>主题颜色</Field.Label>
                <Button size="xs" variant="ghost" colorPalette="gray" onClick={resetColors}>
                  重置
                </Button>
              </HStack>

              <VStack align="stretch" gap={2} w="100%">
                {/* Presets */}
                {theme.colorPresets && theme.colorPresets.length > 0 && (
                  <HStack gap={2} flexWrap="wrap">
                    {theme.colorPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        size="xs"
                        variant="outline"
                        colorPalette="gray"
                        onClick={() => applyPreset(preset.id)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </HStack>
                )}

                {/* Brand color */}
                {brandDef && (
                  <HStack justify="space-between" gap={2}>
                    <Tooltip content={brandDef.label} disabled={brandDef.label.length <= 6}>
                      <Text fontSize="xs" fontWeight="medium" flex={1} minW={0} truncate>
                        {brandDef.label}
                      </Text>
                    </Tooltip>
                    <HStack gap={1} flexShrink={0}>
                      <Input
                        type="color"
                        w="28px"
                        h="28px"
                        p={0}
                        border="none"
                        borderRadius="sm"
                        cursor="pointer"
                        value={resolvedColors[brandDef.key] ?? brandDef.defaultValue}
                        onChange={(e) => setColor(brandDef.key, e.target.value)}
                      />
                      <Input
                        size="xs"
                        w="80px"
                        value={resolvedColors[brandDef.key] ?? brandDef.defaultValue}
                        onChange={(e) => setColor(brandDef.key, e.target.value)}
                        placeholder="#000000"
                        fontFamily="mono"
                        fontSize="xs"
                      />
                    </HStack>
                  </HStack>
                )}

                {/* All other colors — collapsible */}
                {otherDefs.length > 0 && (
                  <Accordion.Root multiple defaultValue={[]}>
                    <Accordion.Item border="none" value="colors">
                      <Accordion.ItemTrigger py={1} px={0}>
                        <Text flex={1} fontSize="xs" fontWeight="bold" color="gray.500" textAlign="left">
                          全部颜色
                        </Text>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent px={0} pb={1}>
                        <Accordion.ItemBody>
                          <VStack gap={2} align="stretch">
                            {otherDefs.map((def) => (
                              <ColorRow
                                key={def.key}
                                def={def}
                                value={resolvedColors[def.key] ?? def.defaultValue}
                                onChange={(v) => setColor(def.key, v)}
                              />
                            ))}
                          </VStack>
                        </Accordion.ItemBody>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                )}
              </VStack>
            </Field.Root>
          )}

          {mode === "edit" && onDelete && (
            <>
              <Separator />
              <Button
                size="sm"
                variant={confirmDelete ? "solid" : "outline"}
                colorPalette="red"
                w="100%"
                onClick={handleDelete}
              >
                {confirmDelete ? "确认删除此项目" : "删除项目"}
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
          {mode === "create" ? "创建" : "保存"}
        </Button>
      </Dialog.Footer>
    </>
  );
}

// ─── Dialog Wrapper ───────────────────────────────────────────────────────────

export default function ProjectSettingsDialog({ open, onClose, mode }: ProjectSettingsDialogProps) {
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const activeProjectDescription = useProjectStore((s) => s.activeProjectDescription);
  const globalThemeId = useProjectStore((s) => s.globalThemeId);
  const themeColors = useProjectStore((s) => s.themeColors);
  const setGlobalThemeId = useProjectStore((s) => s.setGlobalThemeId);
  const setThemeColors = useProjectStore((s) => s.setThemeColors);
  const updateActiveProjectMeta = useProjectStore((s) => s.updateActiveProjectMeta);
  const createProject = useProjectStore((s) => s.createProject);
  const openProject = useProjectStore((s) => s.openProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const triggerRefresh = useEditorStore((s) => s.triggerRefresh);

  const formKey =
    mode === "edit"
      ? `edit:${activeProjectId}:${activeProjectName}:${activeProjectDescription}:${globalThemeId}`
      : "create";

  const handleSave = async (
    name: string,
    description: string,
    themeId: string,
    colors: Partial<ThemeColors>
  ) => {
    if (mode === "create") {
      const id = await createProject(name || "新项目", description, themeId);
      onClose();
      await openProject(id);
      setThemeColors(colors);
      triggerRefresh();
      return;
    }

    updateActiveProjectMeta(name || "未命名项目", description);
    if (themeId !== globalThemeId) {
      setGlobalThemeId(themeId);
    }
    setThemeColors(colors);
    triggerRefresh();
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
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>{mode === "create" ? "新建项目" : "项目设置"}</Dialog.Header>
            <Dialog.CloseTrigger />
            {open && (
              <ProjectSettingsForm
                key={formKey}
                mode={mode}
                initialName={mode === "edit" ? activeProjectName : ""}
                initialDescription={mode === "edit" ? activeProjectDescription : ""}
                initialThemeId={mode === "edit" ? globalThemeId : DEFAULT_THEME_ID}
                initialThemeColors={mode === "edit" ? themeColors : {}}
                onCancel={onClose}
                onSave={handleSave}
                onDelete={mode === "edit" ? handleDelete : undefined}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

