import { create } from 'zustand';
import { ScenarioState } from '../types';

export const useScenarioStore = create<ScenarioState>((set) => ({
  scenarios: [],
  currentScenario: null,
  setScenarios: (scenarios) => set({ scenarios }),
  setCurrentScenario: (scenario) => set({ currentScenario: scenario }),
  addScenario: (scenario) =>
    set((state) => ({ scenarios: [...state.scenarios, scenario] })),
  updateScenario: (scenario) =>
    set((state) => ({
      scenarios: state.scenarios.map((s) =>
        s.id === scenario.id ? scenario : s
      ),
      currentScenario:
        state.currentScenario?.id === scenario.id
          ? scenario
          : state.currentScenario,
    })),
  deleteScenario: (id) =>
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== id),
      currentScenario:
        state.currentScenario?.id === id ? null : state.currentScenario,
    })),
}));
