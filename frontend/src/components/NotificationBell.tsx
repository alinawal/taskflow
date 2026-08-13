import { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import type { AppNotification } from '../types';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch {
      // Silently ignore — notifications are non-critical background data.
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleToggle() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative rounded p-2 text-ink transition-colors hover:bg-paper"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2a6 6 0 0 0-6 6v3.09c0 .5-.2.98-.55 1.33L4 14v1h16v-1l-1.45-1.58a1.88 1.88 0 0 1-.55-1.33V8a6 6 0 0 0-6-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-80 rounded border border-border bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-2 text-sm font-medium">Notifications</div>
          <ul className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted">
                No notifications yet — assign yourself a task to get started.
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-border px-4 py-3 last:border-b-0">
                <p className="text-sm text-ink">{n.message}</p>
                <time className="font-mono text-xs text-muted">
                  {new Date(n.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
