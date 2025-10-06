export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'player';
  name?: string;
}

export interface Asset {
  id: string;
  type: 'image' | 'sound';
  name: string;
  url: string;
  metadata?: Record<string, any>;
  uploadedBy: string; // User ID
  createdAt?: string;
}

export interface Choice {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  text: string;
  condition?: string;
}

export interface Scene {
  id: string;
  scenarioId: string;
  title: string;
  text: string;
  imageId?: string; // Asset ID
  image?: Asset; // Populated asset
  soundId?: string; // Asset ID
  sound?: Asset; // Populated asset
  choices: Choice[];
  position?: { x: number; y: number };
  isStartScene?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  description?: string;
  authorId: string;
  author?: User;
  scenes: Scene[];
  createdAt: string;
  updatedAt?: string;
}

export interface PlayerProgress {
  id: string;
  userId: string;
  scenarioId: string;
  currentSceneId: string;
  history: {
    sceneId: string;
    choiceId: string;
    timestamp: string;
  }[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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