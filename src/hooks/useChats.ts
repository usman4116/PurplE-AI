"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatItem } from "@/lib/utils";

interface UseChatsReturn {
  chats: ChatItem[];
  loading: boolean;
  fetchChats: () => Promise<void>;
  createChat: (title?: string) => Promise<ChatItem | null>;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  pinChat: (id: string) => Promise<void>;
  archiveChat: (id: string) => Promise<void>;
  searchChats: (query: string) => Promise<ChatItem[]>;
  setChats: React.Dispatch<React.SetStateAction<ChatItem[]>>;
}

export function useChats(): UseChatsReturn {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chats?t=${Date.now()}`);
      if (!res.ok) {
        console.warn("Failed to fetch chats (non-200 response)");
        return;
      }
      const data = await res.json();
      setChats(data.data ?? data.chats ?? data ?? []);
    } catch (err) {
      console.warn("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = useCallback(
    async (title?: string): Promise<ChatItem | null> => {
      try {
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title ?? "New Chat" }),
        });
        if (!res.ok) {
          console.warn("Failed to create chat (non-200 response)");
          return null;
        }
        const data = await res.json();
        const newChat: ChatItem = data.data ?? data.chat ?? data;
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      } catch (err) {
        console.warn("Failed to create chat:", err);
        return null;
      }
    },
    []
  );

  const deleteChat = useCallback(async (id: string) => {
    setChats((prev) => prev.filter((c) => c._id !== id));
    try {
      await fetch(`/api/chat/${id}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete chat:", err);
    }
  }, []);

  const renameChat = useCallback(async (id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title } : c))
    );
    try {
      await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch (err) {
      console.warn("Failed to rename chat:", err);
    }
  }, []);

  const pinChat = useCallback(async (id: string) => {
    const chatToPin = chats.find(c => c._id === id);
    const newIsPinned = chatToPin ? !chatToPin.isPinned : true;
    
    setChats((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, isPinned: newIsPinned } : c
      )
    );
    try {
      await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: newIsPinned }),
      });
    } catch (err) {
      console.warn("Failed to pin chat:", err);
    }
  }, [chats]);

  const archiveChat = useCallback(async (id: string) => {
    setChats((prev) => prev.filter((c) => c._id !== id));
    try {
      await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
    } catch (err) {
      console.warn("Failed to archive chat:", err);
    }
  }, []);

  const searchChats = useCallback(
    async (query: string): Promise<ChatItem[]> => {
      if (!query.trim()) {
        await fetchChats();
        return chats;
      }
      try {
        const res = await fetch(
          `/api/chats/search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) {
          console.warn("Failed to search chats (non-200 response)");
          return [];
        }
        const data = await res.json();
        const results: ChatItem[] = data.data ?? data.chats ?? data ?? [];
        return results;
      } catch (err) {
        console.warn("Failed to search chats:", err);
        return [];
      }
    },
    [fetchChats, chats]
  );

  return {
    chats,
    loading,
    fetchChats,
    createChat,
    deleteChat,
    renameChat,
    pinChat,
    archiveChat,
    searchChats,
    setChats,
  };
}
