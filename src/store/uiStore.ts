import { create } from 'zustand';

interface UIState {
  selectedUnitIds: string[];
  selectedEnemyId: string | null;
  isEscMenuOpen: boolean;
  isProbModalOpen: boolean;
  isInventoryModalOpen: boolean;
  isGachaModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  isResultModalOpen: boolean;
  isRankingModalOpen: boolean;
  isCodexModalOpen: boolean;
  scrollPos: { x: number, y: number };
  
  setSelectedUnitIds: (ids: string[]) => void;
  setSelectedEnemyId: (id: string | null) => void;
  setEscMenuOpen: (open: boolean) => void;
  setProbModalOpen: (open: boolean) => void;
  setInventoryModalOpen: (open: boolean) => void;
  setGachaModalOpen: (open: boolean) => void;
  setUpgradeModalOpen: (open: boolean) => void;
  setResultModalOpen: (open: boolean) => void;
  setRankingModalOpen: (open: boolean) => void;
  setCodexModalOpen: (open: boolean) => void;
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
  isGachaModalOpen: false,
  isUpgradeModalOpen: false,
  isResultModalOpen: false,
  isRankingModalOpen: false,
  isCodexModalOpen: false,
  scrollPos: { x: 0, y: 0 },
  
  setSelectedUnitIds: (ids) => set({ selectedUnitIds: ids, selectedEnemyId: null }),
  setSelectedEnemyId: (id) => set({ selectedEnemyId: id, selectedUnitIds: [] }),
  setEscMenuOpen: (open) => set({ isEscMenuOpen: open }),
  setProbModalOpen: (open) => set({ isProbModalOpen: open }),
  setInventoryModalOpen: (open) => set({ isInventoryModalOpen: open }),
  setGachaModalOpen: (open) => set({ isGachaModalOpen: open }),
  setUpgradeModalOpen: (open) => set({ isUpgradeModalOpen: open }),
  setResultModalOpen: (open) => set({ isResultModalOpen: open }),
  setRankingModalOpen: (open) => set({ isRankingModalOpen: open }),
  setCodexModalOpen: (open) => set({ isCodexModalOpen: open }),
  setScrollPos: (x, y) => set({ scrollPos: { x, y } }),
  closeAllModals: () => set({ 
    isEscMenuOpen: false, 
    isProbModalOpen: false, 
    isInventoryModalOpen: false,
    isGachaModalOpen: false,
    isUpgradeModalOpen: false,
    isResultModalOpen: false,
    isRankingModalOpen: false,
    isCodexModalOpen: false,
  }),
  handleMapClick: () => set({
    selectedUnitIds: [],
    selectedEnemyId: null,
    isEscMenuOpen: false,
    isProbModalOpen: false,
    isInventoryModalOpen: false,
    isGachaModalOpen: false,
    isUpgradeModalOpen: false,
    isResultModalOpen: false,
    isRankingModalOpen: false,
    isCodexModalOpen: false,
  }),
}));
