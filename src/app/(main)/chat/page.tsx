'use client';

import { Header } from '@/components/layout/Header';
import { ChatArea } from '@/components/chat/ChatArea';

export default function ChatDashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 overflow-hidden relative">
        <ChatArea />
      </div>
    </div>
  );
}
