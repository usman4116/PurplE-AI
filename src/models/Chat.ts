import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

// ─────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────

/** Hydrated Mongoose document for a Chat. */
export interface IChatDocument extends Document {
  userId: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

const chatSchema = new Schema<IChatDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Chat title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
      default: "New Chat",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────

chatSchema.index({ createdAt: -1 });
chatSchema.index({ title: "text" });

// ─────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────

const Chat: Model<IChatDocument> =
  mongoose.models.Chat ?? mongoose.model<IChatDocument>("Chat", chatSchema);

export default Chat;
