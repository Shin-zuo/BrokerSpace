'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type InquiryNotification = {
  id: string;
  clientName: string;
  property: { title: string };
  createdAt: string;
};

// Simple relative time formatter to avoid date-fns turbopack issues
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function BrokerHeader() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [inquiries, setInquiries] = useState<InquiryNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/broker/inquiries/unread');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
        setInquiries(data.inquiries || []);
      }
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  // Poll for unread count, but immediately clear it if we are on the inquiries page
  useEffect(() => {
    if (pathname === '/inquiries') {
      setUnreadCount(0);
      setInquiries([]);
    } else {
      fetchUnreadCount();
    }

    const interval = setInterval(() => {
      if (window.location.pathname !== '/inquiries') {
        fetchUnreadCount();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 glass-panel border-b border-white/50 flex items-center justify-between px-10 sticky top-0 z-40 backdrop-blur-xl bg-white/40">
      <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
        Broker Dashboard
      </h1>
      
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-full hover:bg-white/60 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <Link 
                    key={inquiry.id}
                    href="/inquiries"
                    onClick={() => setIsOpen(false)}
                    className="block p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-800 line-clamp-2 leading-tight">
                          <span className="font-bold">{inquiry.clientName}</span> inquired about <span className="font-semibold">{inquiry.property.title}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {timeAgo(inquiry.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  You have no new notifications.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <Link 
                href="/inquiries"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View all inquiries
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
