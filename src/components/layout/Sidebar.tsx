'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, Settings, 
  LogOut, MoreVertical, Edit2, Trash2, Pin, User
} from 'lucide-react';
import { useChatContext } from '@/providers/ChatProvider';
import { useChats } from '@/hooks/useChats';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUser, useClerk } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChatListSkeleton } from '@/components/common/LoadingSkeleton';

export function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { sidebarOpen, setSidebarOpen } = useChatContext();

  useKeyboardShortcuts({
    onNewChat: () => {
      handleNewChat();
    }
  });

  const { 
    chats, 
    loading, 
    createChat, 
    deleteChat, 
    renameChat, 
    pinChat,
    searchChats
  } = useChats();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const currentChatId = params.id as string;

  const handleNewChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      router.push(`/chat/${newChat._id}`);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  const handleRenameSubmit = async (id: string) => {
    if (editTitle.trim()) {
      await renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };


  const filteredChats = searchQuery 
    ? chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);

  const containerVariants = {
    open: { width: 280, x: 0, opacity: 1 },
    closed: { width: 0, x: -280, opacity: 0 }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background/95 backdrop-blur-md md:static md:z-auto",
          !sidebarOpen && "hidden md:flex"
        )}
      >
        <div className="flex flex-col gap-4 p-4">
          <Link href="/chat" className="flex items-center gap-3 px-2 py-1 mb-2 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Purple AI Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm bg-white" />
            <span className="text-xl font-bold tracking-tight">Purple AI</span>
          </Link>

          <Button 
            onClick={handleNewChat} 
            className="w-full justify-start gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md border-0"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 bg-muted/50 border-transparent focus:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          {loading ? (
            <ChatListSkeleton />
          ) : (
            <div className="flex flex-col gap-6 py-2">
              {pinnedChats.length > 0 && (
                <div className="px-2">
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">PINNED</h3>
                  <div className="flex flex-col gap-1">
                    {pinnedChats.map(chat => (
                      <ChatItem 
                        key={chat._id} 
                        chat={chat} 
                        currentChatId={currentChatId}
                        editingId={editingId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        setEditingId={setEditingId}
                        handleRenameSubmit={handleRenameSubmit}
                        pinChat={pinChat}
                        deleteChat={deleteChat}
                        router={router}
                        setSidebarOpen={setSidebarOpen}
                      />
                    ))}
                  </div>
                </div>
              )}

              {unpinnedChats.length > 0 && (
                <div className="px-2">
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">RECENT</h3>
                  <div className="flex flex-col gap-1">
                    {unpinnedChats.map(chat => (
                      <ChatItem 
                        key={chat._id} 
                        chat={chat} 
                        currentChatId={currentChatId}
                        editingId={editingId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        setEditingId={setEditingId}
                        handleRenameSubmit={handleRenameSubmit}
                        pinChat={pinChat}
                        deleteChat={deleteChat}
                        router={router}
                        setSidebarOpen={setSidebarOpen}
                      />
                    ))}
                  </div>
                </div>
              )}

              {chats.length === 0 && !loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No chats yet
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="mt-auto border-t p-3 flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-2 gap-3 hover:bg-muted">
                {isLoaded && user ? (
                  <>
                    <img src={user.imageUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-border object-cover" />
                    <div className="flex flex-col items-start text-sm truncate flex-1">
                      <span className="font-medium leading-none truncate w-full">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full">
                        {user.primaryEmailAddress?.emailAddress}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                )}
                <MoreVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-50 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" className="w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut({ redirectUrl: '/login' })}
                className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </>
  );
}

function ChatItem({ 
  chat, 
  currentChatId, 
  editingId, 
  editTitle, 
  setEditTitle, 
  setEditingId, 
  handleRenameSubmit, 
  pinChat, 
  deleteChat,
  router,
  setSidebarOpen
}: any) {
  const isActive = currentChatId === chat._id;

  return (
    <div className="group relative">
      {editingId === chat._id ? (
        <div className="flex items-center gap-2 rounded-md bg-muted px-2 py-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit(chat._id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            onBlur={() => handleRenameSubmit(chat._id)}
            autoFocus
            className="h-6 w-full border-none bg-transparent px-1 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      ) : (
        <Link
          href={`/chat/${chat._id}`}
          onClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
            isActive 
              ? "bg-violet-500/10 text-violet-500 font-medium" 
              : "hover:bg-muted text-foreground"
          )}
        >
          <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-violet-500" : "text-muted-foreground")} />
          <span className="flex-1 truncate">{chat.title}</span>
          
          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            isActive && "opacity-100"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-background">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    setEditTitle(chat.title);
                    setEditingId(chat._id);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); pinChat(chat._id); }}>
                  <Pin className="mr-2 h-4 w-4" /> {chat.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                  onSelect={async (e) => { 
                    e.preventDefault(); 
                    await deleteChat(chat._id); 
                    if (currentChatId === chat._id) {
                      router.push('/chat');
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
      )}
    </div>
  );
}
