"use client";

import { useEffect } from "react";
import { useChatContext } from "@/providers/ChatProvider";

interface KeyboardShortcutOptions {
  onNewChat?: () => void;
  onCloseDialog?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions = {}) {
  const { setIsSearchOpen, isSearchOpen } = useChatContext();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + K → toggle search
      if (isMeta && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
        return;
      }

      // Ctrl/Cmd + N → new chat
      if (isMeta && e.key === "n") {
        e.preventDefault();
        options.onNewChat?.();
        return;
      }

      // Escape → close search/dialogs
      if (e.key === "Escape") {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        }
        options.onCloseDialog?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen, options]);
}
