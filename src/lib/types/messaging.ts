export type Sender = "patient" | "dentist";

export interface MessageRecord {
  id: string;
  threadId: string;
  content: string;
  sender: Sender;
  createdAt: Date;
}

export interface ThreadWithMessages {
  threadId: string | null;
  scanId: string;
  messages: MessageRecord[];
}
