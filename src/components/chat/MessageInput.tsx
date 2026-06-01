"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Message AI...",
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [canSend, value, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="w-full px-3 pb-4 pt-2 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative mx-auto flex max-w-3xl items-end gap-2",
          "rounded-2xl border border-[var(--color-border)]",
          "bg-[var(--color-surface)] p-2",
          "shadow-lg shadow-black/5",
          "transition-all duration-200",
          "focus-within:border-[var(--color-accent)]/50 focus-within:shadow-[var(--color-accent-glow)]",
          "glass-card"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent px-3 py-2",
            "text-[0.9375rem] leading-relaxed",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "outline-none",
            "max-h-[200px] min-h-[40px]",
            "disabled:opacity-50"
          )}
        />

        {/* Send / Stop button */}
        <AnimatePresence mode="wait">
          {isStreaming ? (
            <motion.button
              key="stop"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                "bg-[var(--color-error)] text-white",
                "transition-colors hover:bg-red-600"
              )}
              aria-label="Stop generating"
            >
              <Square className="h-4 w-4" fill="currentColor" />
            </motion.button>
          ) : (
            <motion.button
              key="send"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={canSend ? { scale: 1.05 } : undefined}
              whileTap={canSend ? { scale: 0.95 } : undefined}
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                "transition-all duration-200",
                canSend
                  ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white shadow-lg shadow-[var(--color-accent-glow)] hover:shadow-xl"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
