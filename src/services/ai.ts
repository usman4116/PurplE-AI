/**
 * AI service layer — wraps the OpenAI-compatible chat API (OpenCode Zen).
 *
 * Uses native `fetch` with streaming (ReadableStream) so this works in both
 * Node.js and edge runtimes without any SDK dependency.
 */

import type { AIMessage } from "@/types";

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const API_KEY = () => process.env.OPENCODE_API_KEY ?? "";
const BASE_URL = () =>
  process.env.OPENCODE_API_BASE_URL ?? "https://opencode.ai/zen/v1";
const MODEL = () => process.env.OPENCODE_MODEL ?? "deepseek-v4-flash-free";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

class AIServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

/**
 * Parse an `data: ...` SSE line into a JSON object, or return `null`
 * for keep-alive / `[DONE]` signals.
 */
function parseSSELine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith("data:")) return null;

  const payload = trimmed.slice("data:".length).trim();
  if (payload === "[DONE]") return null;

  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Stream a chat completion from the OpenAI-compatible API.
 *
 * Yields text chunks as they arrive. The caller is responsible for
 * concatenating them and saving the final message.
 */
export async function* streamChatCompletion(
  messages: AIMessage[]
): AsyncGenerator<string> {
  const apiKey = API_KEY();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${BASE_URL()}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL(),
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");

    if (response.status === 429) {
      throw new AIServiceError(
        "AI API rate limit exceeded. Please try again later.",
        429
      );
    }
    if (response.status === 401) {
      throw new AIServiceError("Invalid AI API key.", 401);
    }

    throw new AIServiceError(
      `AI API error (${response.status}): ${errorBody}`,
      response.status
    );
  }

  const body = response.body;
  if (!body) {
    throw new AIServiceError("No response body received from AI API");
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are separated by double newlines.
      const lines = buffer.split("\n");
      // Keep the last partial line in the buffer.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const parsed = parseSSELine(line);
        if (!parsed) continue;

        const choices = parsed.choices as
          | Array<{ delta?: { content?: string }; finish_reason?: string }>
          | undefined;

        const content = choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      const parsed = parseSSELine(buffer);
      if (parsed) {
        const choices = parsed.choices as
          | Array<{ delta?: { content?: string } }>
          | undefined;
        const content = choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Ask the AI to generate a concise chat title from the user's first message.
 * Returns a plain string (no quotes / punctuation decoration).
 */
export async function generateChatTitle(
  firstMessage: string
): Promise<string> {
  const apiKey = API_KEY();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(`${BASE_URL()}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL(),
        messages: [
          {
            role: "system",
            content:
              "Generate a short, concise title (max 6 words) for a chat that starts with the following message. Respond with ONLY the title, no quotes, no punctuation at the end.",
          },
          { role: "user", content: firstMessage },
        ],
        temperature: 0.7,
        max_tokens: 30,
      }),
    });

    if (!response.ok) {
      // Non-critical — fall back to truncated message.
      return firstMessage.slice(0, 50).trim() || "New Chat";
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const title = data.choices?.[0]?.message?.content?.trim();
    return title && title.length > 0
      ? title.slice(0, 100)
      : firstMessage.slice(0, 50).trim() || "New Chat";
  } catch {
    // Network error — non-critical, just use a fallback.
    return firstMessage.slice(0, 50).trim() || "New Chat";
  }
}
