'use client';

import { use } from 'react';
import { Header } from '@/components/layout/Header';
import { ChatArea } from '@/components/chat/ChatArea';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default function IndividualChatPage(props: ChatPageProps) {
  const params = use(props.params);
  
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 overflow-hidden relative">
        <ChatArea chatId={params.id} />
      </div>
    </div>
  );
}
