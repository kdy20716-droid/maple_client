import { create } from 'zustand';
import type { Unit } from '../types/game';

interface UnitState {
  units: Unit[];
  addUnit: (unit: Unit) => void;
  removeUnit: (id: string) => void;
  updateUnitPosition: (id: string, x: number, y: number) => void;
}

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  
  addUnit: (unit) => set((state) => ({ units: [...state.units, unit] })),
  
  removeUnit: (id) => set((state) => ({ 
    units: state.units.filter((u) => u.id !== id) 
  })),
  
  updateUnitPosition: (id, x, y) => set((state) => ({
    units: state.units.map((u) => u.id === id ? { ...u, position: { x, y } } : u)
  })),

  moveUnit: (id, x, y) => set((state) => ({
    units: state.units.map((u) => u.id === id ? { ...u, position: { x, y } } : u)
  })),
}));
