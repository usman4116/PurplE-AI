/**
 * GET /api/chat/[chatId]/messages
 * Fetch messages for a chat with cursor-based pagination (50 per page).
 *
 * Query params:
 *   ?before=<ISO timestamp or message _id>  — fetch older messages
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import type { ApiResponse } from "@/types";
import mongoose from "mongoose";

const PAGE_SIZE = 50;

type RouteContext = { params: Promise<{ chatId: string }> };

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

    // Verify ownership
    const chat = await Chat.findOne({ _id: chatId, userId }).lean();
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Parse cursor
    const url = new URL(req.url);
    const before = url.searchParams.get("before");

    // Build query
    const query: Record<string, unknown> = { chatId: chat._id };

    if (before) {
      // Try to use as ObjectId first (message _id), then as timestamp
      if (mongoose.Types.ObjectId.isValid(before)) {
        query._id = { $lt: new mongoose.Types.ObjectId(before) };
      } else {
        const ts = new Date(before);
        if (!isNaN(ts.getTime())) {
          query.timestamp = { $lt: ts };
        }
      }
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1, _id: -1 })
      .limit(PAGE_SIZE + 1) // Fetch one extra to determine if there are more
      .lean();

    const hasMore = messages.length > PAGE_SIZE;
    if (hasMore) messages.pop(); // Remove the extra one

    // Return in chronological order
    messages.reverse();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        messages,
        hasMore,
        nextCursor: hasMore
          ? messages[0]?._id?.toString()
          : null,
      },
    });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
