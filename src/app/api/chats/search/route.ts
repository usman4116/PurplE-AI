export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import dbConnect from '@/lib/mongoose';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    await dbConnect();

    // Find chats matching the query in title
    const matchingChats = await Chat.find({
      userId: userId,
      $text: { $search: query },
    })
      .select('title createdAt updatedAt')
      .lean();

    // Find messages matching the query and get their corresponding chats
    const matchingMessages = await Message.find({
      $text: { $search: query },
    })
      .populate({
        path: 'chatId',
        match: { userId: userId },
        select: 'title createdAt updatedAt',
      })
      .lean();

    // Combine and deduplicate
    const resultsMap = new Map();

    matchingChats.forEach((chat) => {
      resultsMap.set(chat._id.toString(), {
        ...chat,
        matchType: 'title',
      });
    });

    matchingMessages.forEach((msg) => {
      const chat = msg.chatId as any; // Type workaround since it's populated
      if (chat && chat._id) {
        if (!resultsMap.has(chat._id.toString())) {
          resultsMap.set(chat._id.toString(), {
            _id: chat._id,
            title: chat.title,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            matchType: 'message',
            messageSnippet: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          });
        }
      }
    });

    return NextResponse.json({ results: Array.from(resultsMap.values()) });
  } catch (error) {
    console.error('Error searching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
