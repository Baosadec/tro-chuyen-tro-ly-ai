export enum Sender {
  User = 'User',
  Bot = 'Bot',
  System = 'System'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  isLoading?: boolean;
  image?: string; // Base64 string for image previews
}

export enum AppMode {
  Chat = 'chat',
  Vision = 'vision'
}

export interface VisionState {
  selectedFile: File | null;
  previewUrl: string | null;
  analysis: string;
  isAnalyzing: boolean;
}