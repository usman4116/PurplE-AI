'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { useScrollAnchor } from '@/hooks/useScrollAnchor';
import { useChatContext } from '@/providers/ChatProvider';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { EmptyState } from './EmptyState';
import { StreamingMessage } from './StreamingMessage';
import { ArrowDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  chatId?: string;
}

export function ChatArea({ chatId }: ChatAreaProps) {
  const router = useRouter();
  const { setSidebarOpen } = useChatContext();
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    regenerateMessage,
    editMessage,
    deleteMessage,
    loadMessages,
  } = useChat();

  const {
    scrollRef,
    messagesEndRef,
    isAtBottom,
    scrollToBottom,
  } = useScrollAnchor();

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    }
  }, [chatId]);

  const handleSend = async (content: string) => {
    const newId = await sendMessage(content, chatId);
    if (!chatId && newId) {
      router.push(`/chat/${newId}`);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b bg-background p-4 md:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/chat" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Purple AI" className="h-8 w-8 rounded-lg object-cover shadow-sm bg-white" />
            <span className="font-semibold">Purple AI</span>
          </Link>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-4 sm:p-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-4">
          {!chatId && messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSend} />
          ) : (
            <>
              {messages.map((message, idx) => (
                <MessageBubble
                  key={message._id}
                  index={idx}
                  message={message}
                  onEdit={(content) => editMessage(message._id, content)}
                  onDelete={() => deleteMessage(message._id)}
                  onRegenerate={() => regenerateMessage(message._id)}
                />
              ))}
              
              {isStreaming && (
                <StreamingMessage content={streamingContent} />
              )}
              
              <div ref={messagesEndRef} className="h-px" />
            </>
          )}
        </div>
      </div>

      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 transform">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full border shadow-md"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="bg-background/80 p-4 backdrop-blur-sm sm:p-6">
        <div className="mx-auto max-w-3xl">
          <MessageInput 
            onSend={handleSend} 
            disabled={isStreaming} 
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
