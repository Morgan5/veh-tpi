export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Scenario {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  scenes: Scene[];
  author: User;
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  order?: number;
  image?: string;
  audio?: string;
  music?: string;
  choices: Choice[];
  position?: { x: number; y: number };
  isStartScene?: boolean;
  // Drapeaux de génération d'assets côté backend (utilisés à la création)
  autoGenerateImage?: boolean;
  autoGenerateSound?: boolean;
  autoGenerateMusic?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  targetSceneId: string;
  condition?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export interface ScenarioState {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  setScenarios: (scenarios: Scenario[]) => void;
  setCurrentScenario: (scenario: Scenario | null) => void;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (scenario: Scenario) => void;
  deleteScenario: (id: string) => void;
}
