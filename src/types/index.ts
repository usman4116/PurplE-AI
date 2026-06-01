import type { Types } from "mongoose";

// ─────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────

/** Plain user object (matches the Mongoose User schema). */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────

/** Plain chat object (matches the Mongoose Chat schema). */
export interface IChat {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Message
// ─────────────────────────────────────────────────────────────

/** Plain message object (matches the Mongoose Message schema). */
export interface IMessage {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// Composite / helpers
// ─────────────────────────────────────────────────────────────

/** Chat with its messages pre-loaded. */
export interface ChatWithMessages extends IChat {
  messages: IMessage[];
}

/** Standard JSON envelope returned by every API route. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Subset of user data exposed in the NextAuth session. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

/** A single chunk emitted during an AI streaming response. */
export interface StreamChunk {
  id: string;
  content: string;
  done: boolean;
}

/** Message format accepted by the OpenAI-compatible chat API. */
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
