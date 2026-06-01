export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] h-[50%] w-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>
      
      <div className="z-10 w-full max-w-md p-4 sm:p-0">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex items-center justify-center">
            <img src="/logo.jpg" alt="Purple AI Logo" className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-violet-500/20 bg-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Purple AI</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <div className="rounded-2xl border bg-card/50 p-8 shadow-xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
