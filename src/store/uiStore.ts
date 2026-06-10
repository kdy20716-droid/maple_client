import { create } from 'zustand';

interface UIState {
  selectedUnitIds: string[];
  selectedEnemyId: string | null;
  isEscMenuOpen: boolean;
  isProbModalOpen: boolean;
  isInventoryModalOpen: boolean;
  scrollPos: { x: number, y: number };
  
  setSelectedUnitIds: (ids: string[]) => void;
  setSelectedEnemyId: (id: string | null) => void;
  setEscMenuOpen: (open: boolean) => void;
  setProbModalOpen: (open: boolean) => void;
  setInventoryModalOpen: (open: boolean) => void;
  setScrollPos: (x: number, y: number) => void;
  closeAllModals: () => void;
  handleMapClick: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedUnitIds: [],
  selectedEnemyId: null,
  isEscMenuOpen: false,
  isProbModalOpen: false,
  isInventoryModalOpen: false,
  scrollPos: { x: 0, y: 0 },
  
  setSelectedUnitIds: (ids) => set({ selectedUnitIds: ids.slice(0, 10), selectedEnemyId: null }),
  setSelectedEnemyId: (id) => set({ selectedEnemyId: id, selectedUnitIds: [] }),
  setEscMenuOpen: (open) => set({ isEscMenuOpen: open }),
  setProbModalOpen: (open) => set({ isProbModalOpen: open }),
  setInventoryModalOpen: (open) => set({ isInventoryModalOpen: open }),
  setScrollPos: (x, y) => set({ scrollPos: { x, y } }),
  closeAllModals: () => set({ 
    isEscMenuOpen: false, 
    isProbModalOpen: false, 
    isInventoryModalOpen: false 
  }),
  handleMapClick: () => set({
    selectedUnitIds: [],
    selectedEnemyId: null,
    isEscMenuOpen: false,
    isProbModalOpen: false,
    isInventoryModalOpen: false
  }),
}));
