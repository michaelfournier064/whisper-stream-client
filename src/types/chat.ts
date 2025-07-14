export interface Message {
  id: string;
  content: string;
  fromId: string;
  toId: string;
  timestamp: string;
  delivered: boolean;
}

export interface ConnectionConfig {
  serverUrl: string;
  jwtToken: string;
  userId: string;
  recipientId: string;
}

export interface ChatState {
  isConnected: boolean;
  isConnecting: boolean;
  messages: Message[];
  error: string | null;
}