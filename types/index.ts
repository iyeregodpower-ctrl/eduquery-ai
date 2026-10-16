export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface StudyDocument {
  id: string;
  filename: string;
  uploadedAt: Date;
}