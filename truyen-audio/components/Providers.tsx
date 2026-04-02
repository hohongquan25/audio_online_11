"use client";

import { SessionProvider } from "next-auth/react";
import { AudioProvider } from "@/components/audio/AudioContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
