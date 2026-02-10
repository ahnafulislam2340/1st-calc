
export type Mode = 'standard' | 'scientific' | 'ai';
export type Theme = 'light' | 'dark';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface AIResponse {
  answer: string;
  explanation: string;
  steps?: string[];
}

export enum ButtonType {
  Number = 'number',
  Operator = 'operator',
  Action = 'action',
  Special = 'special'
}
