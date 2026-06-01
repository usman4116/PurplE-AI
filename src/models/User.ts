import mongoose, { Schema, type Document, type Model } from "mongoose";

// ─────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────

/** Hydrated Mongoose document for a User. */
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be at most 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password by default
    },
    avatar: {
      type: String,
      default: function (this: IUserDocument) {
        // Generate a Gravatar URL from the email hash
        const hash = this.email
          ? this.email.trim().toLowerCase()
          : "default";
        return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
      },
    },
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────

userSchema.index({ email: 1 });

// ─────────────────────────────────────────────────────────────
// Model (prevent re-compilation during hot-reload)
// ─────────────────────────────────────────────────────────────

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>("User", userSchema);

export default User;
