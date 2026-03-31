import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorState {
  /** Currently selected node ID */
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;

  /** Active costume index for main preview */
  activeCostumeIndex: number;
  setActiveCostumeIndex: (index: number) => void;

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
      selectNode: (id) => set({ selectedNodeId: id, activeCostumeIndex: 0 }),

      activeCostumeIndex: 0,
      setActiveCostumeIndex: (index) => set({ activeCostumeIndex: index }),

      refreshCounter: 0,
      triggerRefresh: () => set((s) => ({ refreshCounter: s.refreshCounter + 1 })),

      previewLight: true,
      setPreviewLight: (v) => set({ previewLight: v }),

      compactMode: false,
      setCompactMode: (v) => set({ compactMode: v }),
    }),
    {
      name: "scratch-ui-forge:editor",
      partialize: (s) => ({ previewLight: s.previewLight, compactMode: s.compactMode }),
    }
  )
);
