import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import dbConnect from '@/lib/mongoose';
import Chat from '@/models/Chat';
import Message from '@/models/Message';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, format } = await req.json();

    if (!chatId || !['txt', 'md'].includes(format)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await dbConnect();

    const chat = await Chat.findOne({ _id: chatId, userId: userId }).lean();
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .lean();

    let content = '';
    
    if (format === 'md') {
      content = `# ${chat.title}\n\n`;
      messages.forEach(msg => {
        content += `### ${msg.role === 'user' ? 'You' : 'AI'}\n`;
        content += `${msg.content}\n\n---\n\n`;
      });
    } else {
      content = `Chat: ${chat.title}\nDate: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
      messages.forEach(msg => {
        content += `[${msg.role === 'user' ? 'You' : 'AI'}]:\n`;
        content += `${msg.content}\n\n`;
      });
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
