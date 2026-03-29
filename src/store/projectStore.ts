import { create } from "zustand";
import { nanoid } from "nanoid";
import type { ProjectNode } from "@/core/types";
import { ComponentRegistry } from "@/core/ComponentRegistry";
import * as persistence from "@/services/persistence";
import type { ProjectMeta } from "@/services/persistence";

const DEFAULT_THEME_ID = "fluent-light";

interface ProjectState {
  // ─── Multi-project management ──────────────────────────────────────
  projects: ProjectMeta[];
  activeProjectId: string | null;
  activeProjectName: string;
  activeProjectDescription: string;

  loadProjectList: () => Promise<void>;
  createProject: (name: string, description?: string, themeId?: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  updateActiveProjectMeta: (name: string, description: string) => void;
  openProject: (id: string) => Promise<void>;
  closeProject: () => void;
  persistCurrentProject: () => Promise<void>;
  importProjectFromFile: () => Promise<string | null>;

  // ─── Current project data ──────────────────────────────────────────
  nodes: ProjectNode[];
  /** Theme for the current project */
  globalThemeId: string;
  setGlobalThemeId: (themeId: string) => void;

  // CRUD
  addFolder: (name: string, parentId: string | null) => string;
  addComponent: (name: string, parentId: string | null, componentType: string) => string;
  removeNode: (id: string) => void;
  renameNode: (id: string, name: string) => void;
  duplicateNode: (id: string) => string | null;
  moveNode: (id: string, newParentId: string | null, targetNodeId?: string, placement?: "top" | "bottom") => void;
  updateParamValues: (id: string, values: Record<string, unknown>) => void;
  updateSelectedVariants: (id: string, variants: string[]) => void;
  setNodes: (nodes: ProjectNode[]) => void;

  // Helpers
  getChildren: (parentId: string | null) => ProjectNode[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // ─── Multi-project ─────────────────────────────────────────────────
  projects: [],
  activeProjectId: null,
  activeProjectName: "",
  activeProjectDescription: "",

  async loadProjectList() {
    const projects = await persistence.listProjects();
    set({ projects });
  },

  async createProject(name: string, description = "", themeId = DEFAULT_THEME_ID) {
    const id = nanoid(8);
    const now = Date.now();
    await persistence.saveProject({
      id,
      name,
      description,
      nodes: [],
      globalThemeId: themeId,
      createdAt: now,
      updatedAt: now,
    });
    await get().loadProjectList();
    return id;
  },

  async deleteProject(id: string) {
    await persistence.deleteProject(id);
    if (get().activeProjectId === id) {
      persistence.setActiveProjectId(null);
      set({
        activeProjectId: null,
        activeProjectName: "",
        activeProjectDescription: "",
        nodes: [],
        globalThemeId: DEFAULT_THEME_ID,
      });
    }
    await get().loadProjectList();
  },

  updateActiveProjectMeta(name: string, description: string) {
    set({ activeProjectName: name, activeProjectDescription: description });
  },

  async openProject(id: string) {
    // Persist current project before switching
    const { activeProjectId } = get();
    if (activeProjectId) {
      await get().persistCurrentProject();
    }
    const data = await persistence.getProject(id);
    if (!data) return;
    persistence.setActiveProjectId(id);
    set({
      activeProjectId: id,
      activeProjectName: data.name || "未命名项目",
      activeProjectDescription: data.description || "",
      nodes: data.nodes ?? [],
      globalThemeId: data.globalThemeId || DEFAULT_THEME_ID,
    });
  },

  closeProject() {
    const { activeProjectId, nodes, globalThemeId, activeProjectName, activeProjectDescription } = get();
    if (activeProjectId) {
      persistence.getProject(activeProjectId).then((existing) => {
        if (existing) {
          persistence.saveProject({
            ...existing,
            name: activeProjectName,
            description: activeProjectDescription,
            nodes,
            globalThemeId,
          });
        }
      });
    }
    persistence.setActiveProjectId(null);
    set({
      activeProjectId: null,
      activeProjectName: "",
      activeProjectDescription: "",
      nodes: [],
      globalThemeId: DEFAULT_THEME_ID,
    });
  },

  async persistCurrentProject() {
    const { activeProjectId, nodes, globalThemeId, activeProjectName, activeProjectDescription } = get();
    if (!activeProjectId) return;
    const existing = await persistence.getProject(activeProjectId);
    if (existing) {
      await persistence.saveProject({
        ...existing,
        name: activeProjectName,
        description: activeProjectDescription,
        nodes,
        globalThemeId,
      });
    }
    await get().loadProjectList();
  },

  async importProjectFromFile() {
    try {
      const loaded = await persistence.loadProjectFromFile();
      const id = nanoid(8);
      const now = Date.now();
      await persistence.saveProject({
        id,
        name: loaded.name || "导入的项目",
        description: loaded.description || "",
        nodes: loaded.nodes,
        globalThemeId: loaded.globalThemeId || DEFAULT_THEME_ID,
        createdAt: now,
        updatedAt: now,
      });
      await get().loadProjectList();
      return id;
    } catch {
      return null;
    }
  },

  // ─── Current project data ──────────────────────────────────────────
  nodes: [],
  globalThemeId: DEFAULT_THEME_ID,
  setGlobalThemeId: (themeId) => set({ globalThemeId: themeId }),

  addFolder(name, parentId) {
    const id = nanoid(8);
    const siblings = get().getChildren(parentId);
    const node: ProjectNode = {
      id,
      name,
      type: "folder",
      parentId,
      order: siblings.length,
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
    return id;
  },

  addComponent(name, parentId, componentType) {
    const id = nanoid(8);
    const siblings = get().getChildren(parentId);
    const def = ComponentRegistry.get(componentType);
    const selectedVariants = def ? def.variants.filter((v) => v.name !== "disabled").map((v) => v.name) : undefined;
    const node: ProjectNode = {
      id,
      name,
      type: "component",
      parentId,
      order: siblings.length,
      componentType,
      paramValues: {},
      selectedVariants,
    };
    set((s) => ({ nodes: [...s.nodes, node] }));
    return id;
  },

  removeNode(id) {
    const removeIds = new Set<string>();
    const collect = (nodeId: string) => {
      removeIds.add(nodeId);
      get()
        .nodes.filter((n) => n.parentId === nodeId)
        .forEach((n) => collect(n.id));
    };
    collect(id);
    set((s) => ({ nodes: s.nodes.filter((n) => !removeIds.has(n.id)) }));
  },

  renameNode(id, name) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, name } : n)),
    }));
  },

  duplicateNode(id) {
    const src = get().nodes.find((n) => n.id === id);
    if (!src || src.type === "folder") return null;
    const newId = nanoid(8);
    const siblings = get().getChildren(src.parentId);
    const copy: ProjectNode = {
      ...src,
      id: newId,
      name: `${src.name} (副本)`,
      order: siblings.length,
      paramValues: { ...src.paramValues },
    };
    set((s) => ({ nodes: [...s.nodes, copy] }));
    return newId;
  },

  moveNode(id, newParentId, targetNodeId, placement) {
    const state = get();
    const nodeToMove = state.nodes.find((n) => n.id === id);
    if (!nodeToMove) return;

    // Check circular dependency if moving to a folder
    if (newParentId) {
      let currId: string | null = newParentId;
      while (currId) {
        if (currId === id) return; // Prevent dropping into its own descendant
        const parent = state.nodes.find((n) => n.id === currId);
        currId = parent?.parentId ?? null;
      }
    }

    const otherSiblings = state.nodes
      .filter((n) => n.parentId === newParentId && n.id !== id)
      .sort((a, b) => a.order - b.order);

    let newSiblings = [];
    if (targetNodeId && placement) {
      const targetLocalIndex = otherSiblings.findIndex((n) => n.id === targetNodeId);
      if (targetLocalIndex !== -1) {
        const insertIndex = placement === "top" ? targetLocalIndex : targetLocalIndex + 1;
        newSiblings = [
          ...otherSiblings.slice(0, insertIndex),
          { ...nodeToMove, parentId: newParentId },
          ...otherSiblings.slice(insertIndex),
        ];
      } else {
        newSiblings = [...otherSiblings, { ...nodeToMove, parentId: newParentId }];
      }
    } else {
      newSiblings = [...otherSiblings, { ...nodeToMove, parentId: newParentId }];
    }

    const reorderedSiblingsMap = new Map(newSiblings.map((n, i) => [n.id, i]));

    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (reorderedSiblingsMap.has(n.id)) {
          return { ...n, parentId: newParentId, order: reorderedSiblingsMap.get(n.id)! };
        }
        return n;
      }),
    }));
  },

  updateParamValues(id, values) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, paramValues: { ...n.paramValues, ...values } } : n)),
    }));
  },

  updateSelectedVariants(id, variants) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, selectedVariants: variants } : n)),
    }));
  },

  setNodes(nodes) {
    set({ nodes });
  },

  getChildren(parentId) {
    return get()
      .nodes.filter((n) => n.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  },
}));
