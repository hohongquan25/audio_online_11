"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  time: string;
  type: 'log' | 'error' | 'warn';
  message: string;
}

export default function MobileDebugLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: 'log' | 'error' | 'warn', ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-50), { time, type, message }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    // Catch global errors
    const errorHandler = (e: ErrorEvent) => {
      addLog('error', 'Global Error:', e.message, e.filename, e.lineno);
    };

    const rejectionHandler = (e: PromiseRejectionEvent) => {
      addLog('error', 'Unhandled Promise:', e.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Log initial load
    addLog('log', '🚀 MobileDebugLogger initialized');

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={() => setVisible(!visible)}
        onTouchStart={() => setVisible(!visible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: visible ? '#ef4444' : '#8b5cf6',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          zIndex: 99999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {visible ? '✕' : '🐛'}
      </button>

      {/* Log panel */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: 'calc(100vw - 40px)',
            maxWidth: '500px',
            maxHeight: '60vh',
            backgroundColor: '#1a1a1a',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            zIndex: 99998,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              Debug Logs ({logs.length})
            </span>
            <button
              onClick={() => setLogs([])}
              style={{
                padding: '4px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            fontSize: '11px',
            fontFamily: 'monospace'
          }}>
            {logs.length === 0 ? (
              <div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
                No logs yet...
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    backgroundColor: log.type === 'error' ? '#7f1d1d' : log.type === 'warn' ? '#78350f' : '#1e293b',
                    color: log.type === 'error' ? '#fca5a5' : log.type === 'warn' ? '#fcd34d' : '#cbd5e1',
                    wordBreak: 'break-word'
                  }}
                >
                  <span style={{ color: '#94a3b8', marginRight: '8px' }}>{log.time}</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
