'use client';

import { useParams } from 'next/navigation';
import { Menu, Share, Download, MoreHorizontal } from 'lucide-react';
import { useChatContext } from '@/providers/ChatProvider';
import { useChats } from '@/hooks/useChats';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const params = useParams();
  const chatId = params.id as string;
  const { sidebarOpen, setSidebarOpen } = useChatContext();
  const { chats } = useChats();

  const currentChat = chats.find(c => c._id === chatId);

  const handleExport = async (format: 'txt' | 'md') => {
    if (!chatId) return;
    try {
      const res = await fetch('/api/chats/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, format }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentChat?.title || 'chat'}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-semibold truncate max-w-[200px] sm:max-w-xs text-foreground/90">
          {currentChat?.title || 'New Chat'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {chatId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <Share className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <Download className="mr-2 h-4 w-4" /> Export as TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('md')}>
                <Download className="mr-2 h-4 w-4" /> Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <ThemeToggle />

        {chatId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Delete Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
