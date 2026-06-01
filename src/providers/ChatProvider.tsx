"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { ChatItem } from "@/lib/utils";

interface ChatContextValue {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chats: ChatItem[];
  setChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  refreshChats: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function ChatProvider({ children }: Props) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshChats = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Expose refreshKey so consumers can react to it
  void refreshKey;

  return (
    <ChatContext.Provider
      value={{
        activeChatId,
        setActiveChatId,
        sidebarOpen,
        setSidebarOpen,
        chats,
        setChats,
        isSearchOpen,
        setIsSearchOpen,
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return ctx;
}
