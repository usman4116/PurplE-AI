"use client";

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  const displayLanguage = language || "text";

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-[var(--color-border-subtle)]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#1e1e2e] px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {displayLanguage}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text-secondary)]"
          aria-label="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-[var(--color-success)]"
              >
                <Check className="h-3.5 w-3.5" />
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code content */}
      <SyntaxHighlighter
        language={displayLanguage}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "#0d1117",
          padding: "16px",
          fontSize: "0.875rem",
          lineHeight: "1.7",
        }}
        showLineNumbers={value.split("\n").length > 3}
        lineNumberStyle={{
          color: "#3d4450",
          paddingRight: "16px",
          minWidth: "2.5em",
          fontSize: "0.8rem",
        }}
        wrapLines
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
