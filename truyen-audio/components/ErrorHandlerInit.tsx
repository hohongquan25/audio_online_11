'use client';

import { useEffect } from 'react';

export default function ErrorHandlerInit() {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error('[Global Error]', e.error || e.message);
      // Reduced severity: don't wipe the page, just log it.
      // MobileDebugLogger will catch this and show it in the bug menu.
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      console.error('[Unhandled Promise]', e.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
