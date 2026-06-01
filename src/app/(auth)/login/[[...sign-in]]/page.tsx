'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex justify-center py-8">
      <SignIn routing="path" path="/login" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat" />
    </div>
  );
}
