"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { markNotificationRead } from "@/app/actions/notifications";
import { formatDate } from "@/lib/utils";
import Dropdown from "@/components/ui/Dropdown";

interface Notif { id: string; title: string; content: string; createdAt: string; isRead: boolean; }

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(d => {
      setNotifs(d.notifications || []);
      setUnread(d.unreadCount || 0);
    }).catch(() => {});
  }, []);

  async function handleOpen() {
    setOpen(!open);
    if (!open && session?.user && unread > 0) {
      // Mark all as read
      for (const n of notifs.filter(n => !n.isRead)) {
        await markNotificationRead(n.id);
      }
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    }
  }

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={handleOpen} 
        style={{ touchAction: 'manipulation', minWidth: '44px', minHeight: '44px' }}
        className="relative rounded-lg p-2 text-gray-400 hover:bg-[#2a2a4a] hover:text-white" 
        aria-label="Thông báo"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <Dropdown
        isOpen={open}
        onClose={() => setOpen(false)}
        trigger={buttonRef.current}
        position="bottom-right"
        className="w-80 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] shadow-xl"
      >
        <div className="border-b border-[#2a2a4a] px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Thông báo</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">Không có thông báo</p>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`border-b border-[#2a2a4a] px-4 py-3 ${!n.isRead ? "bg-purple-600/5" : ""}`}>
                <p className="text-sm font-medium text-gray-200">{n.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{n.content}</p>
                <p className="mt-1 text-[10px] text-gray-600">{formatDate(n.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </Dropdown>
    </>
  );
}
