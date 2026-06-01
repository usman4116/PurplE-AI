'use client';

import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="flex justify-center py-8">
      <SignUp routing="path" path="/register" forceRedirectUrl="/chat" fallbackRedirectUrl="/chat" />
    </div>
  );
}
