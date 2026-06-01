"use client";

import { useState, useCallback, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Pencil,
  Trash2,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { cn, copyToClipboard, formatDate } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import type { Message } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: Message;
  index: number;
  userImage?: string | null;
  userName?: string | null;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  index,
  userImage,
  userName,
  onEdit,
  onDelete,
  onRegenerate,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === "user";

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  const handleEdit = useCallback(() => {
    if (isEditing && editContent !== message.content) {
      onEdit?.(message._id, editContent);
    }
    setIsEditing(!isEditing);
  }, [isEditing, editContent, message, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditContent(message.content);
    setIsEditing(false);
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className={cn("group flex gap-3 px-4 py-4 md:px-6", isUser ? "justify-end" : "justify-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] shadow-lg shadow-[var(--color-accent-glow)]">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%]",
          isUser ? "order-1" : "order-2"
        )}
      >
        {/* Message content */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white"
              : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]"
          )}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[60px] rounded-lg bg-[var(--color-surface-hover)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none resize-none border border-[var(--color-border)]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-lg bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-white hover:bg-[var(--color-accent-light)] transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg bg-[var(--color-surface-hover)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("prose-chat", isUser ? "text-white" : "")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? "");
                    const value = String(children).replace(/\n$/, "");

                    if (match) {
                      return (
                        <CodeBlock language={match[1]} value={value} />
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Open links in new tab
                  a({ children, ...props }) {
                    return (
                      <a target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions + Timestamp row */}
        <AnimatePresence>
          {isHovered && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "mt-1.5 flex items-center gap-1",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <span className="mr-2 text-xs text-[var(--color-text-muted)]">
                {formatDate(message.timestamp)}
              </span>

              <ActionButton
                icon={copied ? Check : Copy}
                label="Copy"
                onClick={handleCopy}
                active={copied}
              />

              {isUser && onEdit && (
                <ActionButton
                  icon={Pencil}
                  label="Edit"
                  onClick={() => setIsEditing(true)}
                />
              )}

              {!isUser && onRegenerate && (
                <ActionButton
                  icon={RefreshCw}
                  label="Regenerate"
                  onClick={() => onRegenerate(message._id)}
                />
              )}

              {onDelete && (
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  onClick={() => onDelete(message._id)}
                  danger
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)]">
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
        </div>
      )}
    </motion.div>
  );
});

/* ─── Small Action Button ─── */

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "text-[var(--color-success)]"
          : danger
          ? "text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-red-500/10"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-white/5"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </motion.button>
  );
}
