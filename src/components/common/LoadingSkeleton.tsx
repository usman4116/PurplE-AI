'use client';

export function ChatListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-12 w-full animate-pulse items-center gap-3 rounded-md bg-muted/50 p-2">
          <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
          <div className="h-4 flex-1 rounded bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-4 p-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted/50" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-24 rounded bg-muted/50" />
        <div className="h-20 w-full rounded-md bg-muted/30" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden h-full w-[280px] border-r bg-muted/10 sm:block">
        <div className="p-4"><div className="h-10 w-full animate-pulse rounded-md bg-muted/50" /></div>
        <ChatListSkeleton />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="h-14 w-full border-b bg-muted/5" />
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <MessageSkeleton />
            <MessageSkeleton />
          </div>
        </div>
        <div className="h-24 w-full bg-muted/5 p-4">
          <div className="mx-auto h-full max-w-3xl animate-pulse rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
