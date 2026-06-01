/**
 * POST /api/chat
 * Start or continue an AI chat — streams the response via SSE.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongoose";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { messageSchema } from "@/lib/validations";
import { streamChatCompletion, generateChatTitle } from "@/services/ai";
import { rateLimit } from "@/lib/rate-limit";
import type { AIMessage, ApiResponse } from "@/types";

export async function POST(req: Request) {
  try {
    // ── Auth ──
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Rate limit: 30 messages per minute ──
    const rl = rateLimit(`chat:${userId}`, 30, 60_000);
    if (!rl.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Rate limit exceeded. Slow down." },
        { status: 429 }
      );
    }

    // ── Validate body ──
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json<ApiResponse>(
        { success: false, error: msg },
        { status: 400 }
      );
    }

    const { content, chatId } = parsed.data;

    await connectDB();

    // ── Resolve or create chat ──
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
      if (!chat) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Chat not found" },
          { status: 404 }
        );
      }
    } else {
      // Create a new chat
      chat = await Chat.create({ userId, title: "New Chat" });
    }

    // If it's still named "New Chat", rename it to the first message!
    if (chat.title === "New Chat") {
      let newTitle = content.replace(/\n/g, " ").trim();
      if (newTitle.length > 50) {
        newTitle = newTitle.substring(0, 50) + "...";
      }
      chat.title = newTitle; // Make it available to the stream controller

      // Fire-and-forget title update
      Chat.updateOne({ _id: chat._id }, { title: newTitle })
        .catch((err) => console.error("Title generation failed:", err));
    }

    // ── Save the user message ──
    await Message.create({
      chatId: chat._id,
      role: "user",
      content,
    });

    // ── Build context: last 20 messages ──
    const recentMessages = await Message.find({ chatId: chat._id })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // Reverse so they're in chronological order
    const contextMessages: AIMessage[] = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role as AIMessage["role"],
        content: m.content,
      }));

    // Prepend a system prompt
    const messages: AIMessage[] = [
      {
        role: "system",
        content:
          "You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and well-formatted responses. Use markdown when appropriate.",
      },
      ...contextMessages,
    ];

    // ── Stream the response ──
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const gen = streamChatCompletion(messages);

          for await (const chunk of gen) {
            fullResponse += chunk;
            // Send as SSE event
            const sseData = JSON.stringify({
              content: chunk,
              chatId: chat!._id.toString(),
            });
            controller.enqueue(
              encoder.encode(`data: ${sseData}\n\n`)
            );
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, chatId: chat!._id.toString(), title: chat!.title })}\n\n`
            )
          );
          controller.close();

          // Save the full assistant response
          if (fullResponse.trim()) {
            await Message.create({
              chatId: chat!._id,
              role: "assistant",
              content: fullResponse,
            });

            // Touch updatedAt on the chat
            await Chat.updateOne(
              { _id: chat!._id },
              { updatedAt: new Date() }
            );
          }
        } catch (error) {
          console.error("Stream error:", error);
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
        "X-Chat-Id": chat._id.toString(),
      },
    });
  } catch (error) {
    console.error("Chat POST error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
