/**
 * PATCH  /api/chat/[chatId]/messages/[messageId] — Edit message content (user messages only)
 * DELETE /api/chat/[chatId]/messages/[messageId] — Delete a message
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import type { ApiResponse } from "@/types";

type RouteContext = {
  params: Promise<{ chatId: string; messageId: string }>;
};

// ─────────────────────────────────────────────────────────────
// PATCH — edit a user message
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
        const { chatId, messageId } = await context.params;

    const body = await req.json();
    const content = body?.content as string | undefined;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify chat ownership
    const chat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Only allow editing user messages
    const message = await Message.findOne({
      _id: messageId,
      chatId: chat._id,
    });

    if (!message) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    if (message.role !== "user") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Only user messages can be edited" },
        { status: 403 }
      );
    }

    message.content = content.trim();
    await message.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: message.toObject(),
      message: "Message updated",
    });
  } catch (error) {
    console.error("Message PATCH error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE — delete a message
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
        const { chatId, messageId } = await context.params;

    await connectDB();

    // Verify chat ownership
    const chat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    const result = await Message.findOneAndDelete({
      _id: messageId,
      chatId: chat._id,
    });

    if (!result) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error("Message DELETE error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
