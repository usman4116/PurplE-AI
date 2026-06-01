/**
 * GET    /api/chat/[chatId]  — Fetch a single chat (verify ownership)
 * PATCH  /api/chat/[chatId]  — Update chat (rename, pin, archive)
 * DELETE /api/chat/[chatId]  — Delete chat and all its messages
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { chatUpdateSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ chatId: string }> };

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

export async function GET(req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
        const { chatId } = await context.params;

    await connectDB();

    const chat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true, data: chat });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH
// ─────────────────────────────────────────────────────────────

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
        const { chatId } = await context.params;

    const body = await req.json();
    const parsed = chatUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json<ApiResponse>(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: chat,
      message: "Chat updated",
    });
  } catch (error) {
    console.error("Chat PATCH error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
        const { chatId } = await context.params;

    await connectDB();

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Delete all messages belonging to this chat
    await Message.deleteMany({ chatId: chat._id });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Chat deleted",
    });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
