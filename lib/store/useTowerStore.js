import { create } from 'zustand';

export const useTowerStore = create((set) => ({
  selectedTower: '',
  setSelectedTower: (tower) => set({ selectedTower: tower }),
}));

