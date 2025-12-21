
export interface LogEntry {
  id: string;
  timestamp: number;
  increment: number;
  newValue: number;
}

export interface CounterSession {
  id: string;
  startTime: number;
  endTime?: number;
  startValue: number;
  endValue?: number;
  notes?: string;
  duration?: number; // in seconds
}

export interface Counter {
  id: string;
  name: string;
  count: number;
  goal?: number;
  color: string;
  icon: string;
  category: string;
  createdAt: number;
  isArchived: boolean;
  logs: LogEntry[];
  sessions: CounterSession[];
  order: number;
  activeSessionId?: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export type ViewType = 'dashboard' | 'counters' | 'history' | 'settings';
export type Theme = 'light' | 'dark' | 'system';
