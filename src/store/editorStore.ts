import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorState {
  /** Currently selected node ID */
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;

  /** Active variant/part for main preview (frame selection) */
  activeVariant: string | null;
  activePart: string | null;
  setActiveFrame: (variant: string | null, part?: string | null) => void;

  /** Refresh counter — increment to force preview re-render */
  refreshCounter: number;
  triggerRefresh: () => void;

  /** Preview canvas background: true = light checkerboard, false = dark */
  previewLight: boolean;
  setPreviewLight: (v: boolean) => void;

  /** Compact mode: true = smaller parameter components */
  compactMode: boolean;
  setCompactMode: (v: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      selectedNodeId: null,
      selectNode: (id) => set({ selectedNodeId: id, activeVariant: null, activePart: null }),

      activeVariant: null,
      activePart: null,
      setActiveFrame: (variant, part = null) => set({ activeVariant: variant, activePart: part }),

      refreshCounter: 0,
      triggerRefresh: () => set((s) => ({ refreshCounter: s.refreshCounter + 1 })),

      previewLight: true,
      setPreviewLight: (v) => set({ previewLight: v }),

      compactMode: false,
      setCompactMode: (v) => set({ compactMode: v }),
    }),
    {
      name: "scratch-ui-forge:editor",
      // Only persist display preferences, not transient selection/refresh state
      partialize: (s) => ({ previewLight: s.previewLight, compactMode: s.compactMode }),
    }
  )
);
