import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

// ─────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────

/** Hydrated Mongoose document for a Message. */
export interface IMessageDocument extends Document {
  chatId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

const messageSchema = new Schema<IMessageDocument>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
    required: [true, "Chat ID is required"],
    index: true,
  },
  role: {
    type: String,
    enum: {
      values: ["user", "assistant", "system"],
      message: "Role must be user, assistant, or system",
    },
    required: [true, "Role is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────

messageSchema.index({ timestamp: 1 });
messageSchema.index({ content: "text" });

// ─────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────

const Message: Model<IMessageDocument> =
  mongoose.models.Message ??
  mongoose.model<IMessageDocument>("Message", messageSchema);

export default Message;
