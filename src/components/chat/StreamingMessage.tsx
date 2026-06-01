"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface StreamingMessageProps {
  content: string;
}

export const StreamingMessage = memo(function StreamingMessage({
  content,
}: StreamingMessageProps) {
  const hasContent = content.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 px-4 py-4 md:px-6"
    >
      {/* AI Avatar */}
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-light)] shadow-lg shadow-[var(--color-accent-glow)] animate-pulse-glow">
        <Sparkles className="h-4 w-4 text-white" />
      </div>

      <div className="max-w-[85%] md:max-w-[75%] lg:max-w-[65%]">
        <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3 text-[0.9375rem] leading-relaxed border border-[var(--color-border-subtle)]">
          {hasContent ? (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className ?? "");
                    const value = String(children).replace(/\n$/, "");

                    if (match) {
                      return <CodeBlock language={match[1]} value={value} />;
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ children, ...props }) {
                    return (
                      <a target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>

              {/* Blinking cursor */}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="inline-block ml-0.5 w-[2px] h-[1.1em] bg-[var(--color-accent-light)] align-text-bottom"
              />
            </div>
          ) : (
            /* Waiting for first chunk - animated dots */
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                  className="h-2 w-2 rounded-full bg-[var(--color-accent-light)]"
                />
              ))}
              <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                Thinking...
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
