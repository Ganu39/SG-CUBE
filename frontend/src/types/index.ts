export type AssistantState =
  | "IDLE"
  | "LISTENING"
  | "USER_SPEAKING"
  | "AI_THINKING"
  | "AI_SPEAKING"
  | "SAFETY_ALERT"
  | "SLEEPING"
  | "PAUSED";

export interface SystemStatus {
  camera: "Active" | "Paused" | "Error";
  fps: number;
  microphone: "Active" | "Muted";
  speaker: "Active" | "Muted";
  ai: "Ready" | "Connecting" | "Offline";
  battery: string;
  network: "Online" | "Degraded" | "Offline";
}

export interface EnvironmentState {
  people: string;
  room: string;
  lighting: string;
  noise: string;
  safety: "Clear" | "Alert";
}

export interface SceneState {
  people: string;
  left: string;
  center: string;
  right: string;
  path: string;
}

export interface HistoryItem {
  id?: string;
  time: string;
  sender: "user" | "ai" | "system";
  text: string;
}

export interface MemoryItem {
  id?: string;
  key: string;
  value: string;
  category?: string;
  timestamp?: string;
}

export interface DiagnosticCheck {
  id: string;
  name: string;
  status: "PASS" | "WARNING" | "FAIL";
  details: string;
  remedy: string | null;
}

export interface DiagnosticResult {
  overall: "PASS" | "WARNING" | "FAIL";
  timestamp: number;
  checks: DiagnosticCheck[];
}

export interface SetupStatus {
  first_run_completed: boolean;
  user_name: string;
  user_display_name: string;
  has_api_key: boolean;
  masked_key: string;
  keys?: Record<string, { configured: boolean; masked: string }>;
  active_slot?: number;
}

export interface PersonProfile {
  id: string;
  name: string;
  enrollment_count?: number;
  created_at?: string;
}

export type NavTab = "home" | "vision" | "memory" | "history" | "people" | "glasses";

export interface BackendState {
  state: AssistantState;
  pulse: number;
  status: SystemStatus;
  environment: EnvironmentState;
  scene: SceneState;
  history: HistoryItem[];
  memories: MemoryItem[];
  activeTab: NavTab;
  currentTranscription: string;
  activeModel: string;
  isSleeping: boolean;
  firstRunCompleted?: boolean;
  userName?: string;
  hasApiKey?: boolean;
}
