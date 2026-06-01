"use client";

import { useState, useCallback, useRef } from "react";
import { useChatContext } from "@/providers/ChatProvider";

export interface Message {
  _id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  sendMessage: (content: string, chatId?: string) => Promise<string | null>;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  
  const { setChats } = useChatContext();

  const loadMessages = useCallback(async (chatId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/${chatId}/messages?t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      const loadedMessages = data.data?.messages ?? data.messages ?? data.data ?? data ?? [];
      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, chatId?: string): Promise<string | null> => {
      // Abort any previous stream
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Optimistically add user message
      const tempUserMsg: Message = {
        _id: `temp-${Date.now()}`,
        chatId: chatId ?? "",
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setIsStreaming(true);
      setStreamingContent("");

      let newChatId = chatId ?? null;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, chatId }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }

        // Check for new chat ID in response header
        const responseChatId = res.headers.get("x-chat-id");
        if (responseChatId) newChatId = responseChatId;

        // Handle streaming response
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                const token =
                  parsed.content ??
                  parsed.choices?.[0]?.delta?.content ??
                  parsed.token ??
                  "";
                if (token) {
                  fullContent += token;
                  setStreamingContent(fullContent);
                }
                if (parsed.chatId) newChatId = parsed.chatId;
                if (parsed.title) {
                  setChats((prev) => 
                    prev.map((c) => c._id === newChatId ? { ...c, title: parsed.title } : c)
                  );
                }
              } catch {
                // Not JSON, treat as plain text token
                fullContent += data;
                setStreamingContent(fullContent);
              }
            }
          }
        }

        // Add the complete assistant message
        const assistantMsg: Message = {
          _id: `msg-${Date.now()}`,
          chatId: newChatId ?? chatId ?? "",
          role: "assistant",
          content: fullContent,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Stream error:", err);
          const errorMessage = err instanceof Error ? err.message : "I'm sorry, I encountered an unknown error.";
          const errorMsg: Message = {
            _id: `err-${Date.now()}`,
            chatId: chatId ?? "",
            role: "assistant",
            content: `**Error:** ${errorMessage}`,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }

      return newChatId;
    },
    []
  );

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      const msgIndex = messages.findIndex((m) => m._id === messageId);
      if (msgIndex === -1) return;

      // Find the user message before this assistant message
      let userMessage: Message | null = null;
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userMessage = messages[i];
          break;
        }
      }
      if (!userMessage) return;

      // Remove the assistant message and re-send
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      await sendMessage(userMessage.content, userMessage.chatId);
    },
    [messages, sendMessage]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const msgIndex = messages.findIndex((m) => m._id === messageId);
      if (msgIndex === -1) return;

      // Update the message and remove all subsequent messages
      setMessages((prev) => {
        const updated = prev.slice(0, msgIndex);
        updated.push({ ...prev[msgIndex], content });
        return updated;
      });

      // Re-send with edited content
      const msg = messages[msgIndex];
      await sendMessage(content, msg.chatId);
    },
    [messages, sendMessage]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    try {
      await fetch(`/api/messages/${messageId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateMessage,
    editMessage,
    deleteMessage,
    loadMessages,
    setMessages,
    isLoading,
  };
}
