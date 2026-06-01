/**
 * POST /api/chat/[chatId]/regenerate
 * Regenerate the last assistant response.
 *
 * 1. Delete the last assistant message
 * 2. Re-stream AI response with the same context
 * 3. Save the new response
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { streamChatCompletion } from "@/services/ai";
import { rateLimit } from "@/lib/rate-limit";
import type { AIMessage, ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ chatId: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
        const { chatId } = await context.params;

    // Rate limit
    const rl = rateLimit(`regen:${userId}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    await connectDB();

    // Verify chat ownership
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Chat not found" },
        { status: 404 }
      );
    }

    // Find and delete the last assistant message
    const lastAssistant = await Message.findOne({
      chatId: chat._id,
      role: "assistant",
    }).sort({ timestamp: -1 });

    if (lastAssistant) {
      await Message.deleteOne({ _id: lastAssistant._id });
    }

    // Build context from remaining messages (last 20)
    const recentMessages = await Message.find({ chatId: chat._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const contextMessages: AIMessage[] = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role as AIMessage["role"],
        content: m.content,
      }));

    const messages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-formatted responses. Use markdown when appropriate.",
      },
      ...contextMessages,
    ];

    // Stream the regenerated response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const gen = streamChatCompletion(messages);

          for await (const chunk of gen) {
            fullResponse += chunk;
            const sseData = JSON.stringify({
              content: chunk,
              chatId: chat!._id.toString(),
            });
            controller.enqueue(
              encoder.encode(`data: ${sseData}\n\n`)
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, chatId: chat!._id.toString() })}\n\n`
            )
          );
          controller.close();

          // Save the new assistant response
          if (fullResponse.trim()) {
            await Message.create({
              chatId: chat!._id,
              role: "assistant",
              content: fullResponse,
            });
          }
        } catch (error) {
          console.error("Regenerate stream error:", error);
          const errMsg =
            error instanceof Error ? error.message : "AI service error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errMsg })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Regenerate POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
