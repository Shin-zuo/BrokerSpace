'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Search, Settings, LogOut, User, Bell, X } from 'lucide-react';
import NavbarSearch from './NavbarSearch';
import { useSidebar } from './SidebarContext';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutAction } from '@/src/app/actions/auth';
import useSWR from 'swr';
import { useChat } from '@/src/components/chat/ChatContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Navbar({ user }: { user?: any }) {
  const pathname = usePathname();
  const { openChat } = useChat();
  const { toggleSidebar } = useSidebar();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { data: convData } = useSWR(user ? '/api/conversations' : null, fetcher, { refreshInterval: 5000 });
  const { data: notifData, mutate: mutateNotif } = useSWR(user ? '/api/notifications' : null, fetcher, { refreshInterval: 10000 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setIsMessagesOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadMessagesCount = Array.isArray(convData) 
    ? convData.reduce((total, c) => total + (c._count?.messages || 0), 0)
    : 0;

  const unreadNotifCount = Array.isArray(notifData)
    ? notifData.filter(n => !n.isRead).length
    : 0;

  const handleMarkNotifRead = async () => {
    if (!Array.isArray(notifData) || unreadNotifCount === 0) return;
    const unreadIds = notifData.filter(n => !n.isRead).map(n => n.id);
    
    // Optimistic update
    mutateNotif(notifData.map((n: any) => ({ ...n, isRead: true })), false);
    
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds })
      });
      mutateNotif();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-1 sm:gap-4 lg:gap-8">
        {pathname === '/feed' && (
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center border-none outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link href="/feed" className="flex items-center gap-2 cursor-pointer pl-1 sm:pl-0">
          <img src="/brokerSpace.png" alt="BrokerSpace Logo" className="h-10 sm:h-12 w-auto object-contain" />
          <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">BrokerSpace</span>
        </Link>
        
        <NavbarSearch />
      </div>

      <div className="flex items-center gap-2">
        <Link href="/feed" className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${pathname.startsWith('/feed') ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Home className="w-5 h-5" />
          <span className="hidden sm:block">Feed</span>
        </Link>

        {user ? (
          <>
            {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsMessagesOpen(false);
              if (!isNotificationsOpen) handleMarkNotifRead();
            }} 
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none outline-none ${isNotificationsOpen ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block">Notifications</span>
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 flex flex-col"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
                  {!notifData ? (
                    <div className="text-center py-8 text-sm text-slate-500">Loading...</div>
                  ) : notifData.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-500">No new notifications</div>
                  ) : (
                    notifData.map((notif: any) => {
                      const isFriendRequest = notif.type === 'FRIEND_REQUEST';
                      const ContentWrapper: any = isFriendRequest ? Link : 'div';
                      const wrapperProps = isFriendRequest ? { href: '/network#requests', onClick: () => setIsNotificationsOpen(false) } : {};

                      return (
                        <div key={notif.id} className="relative group">
                          <ContentWrapper 
                            {...wrapperProps}
                            className={`p-3 hover:bg-slate-50 rounded-lg flex gap-3 text-sm transition-colors border-b border-slate-100 last:border-0 ${isFriendRequest ? 'cursor-pointer' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 overflow-hidden">
                               {notif.actor?.broker?.profilePictureUrl ? (
                                 <img src={notif.actor.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                               ) : (
                                 <User className="w-4 h-4" />
                               )}
                            </div>
                            <div className="pr-6">
                              <p className="text-slate-700">
                                <span className="font-semibold text-slate-900">{notif.actor?.broker?.name}</span>
                                {notif.type === 'LIKE' ? ' liked your property listing' : notif.type === 'FRIEND_REQUEST' ? ' sent you a friend request' : ' interacted with you'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </ContentWrapper>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' });
                              mutateNotif();
                            }}
                            className="absolute top-4 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages Dropdown */}
        <div className="relative" ref={messagesRef}>
          <button 
            onClick={() => {
              setIsMessagesOpen(!isMessagesOpen);
              setIsNotificationsOpen(false);
            }} 
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none outline-none ${isMessagesOpen || pathname.startsWith('/messages') ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </div>
            <span className="hidden sm:block">Messages</span>
          </button>
          
          <AnimatePresence>
            {isMessagesOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 flex flex-col"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-900">Recent Messages</h3>
                  <Link href="/messages" className="text-xs text-teal-600 hover:text-teal-700 font-medium" onClick={() => setIsMessagesOpen(false)}>
                    View all
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 flex flex-col gap-1">
                  {!convData ? (
                    <div className="text-center py-8 text-sm text-slate-500">Loading recent chats...</div>
                  ) : convData.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-500">No recent chat</div>
                  ) : (
                    convData.slice(0, 5).map((conv: any) => {
                      const otherParticipant = conv.participantOneId === user?.id ? conv.participantTwo : conv.participantOne;
                      const lastMsg = conv.messages?.[0];
                      const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderId !== user?.id;
                      
                      return (
                        <div 
                          key={conv.id} 
                          onClick={() => {
                            openChat(conv.id);
                            setIsMessagesOpen(false);
                          }}
                          className="p-3 hover:bg-slate-50 rounded-lg flex gap-3 text-sm transition-colors cursor-pointer border-b border-slate-100 last:border-0 items-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 overflow-hidden relative">
                             {otherParticipant?.broker?.profilePictureUrl ? (
                               <img src={otherParticipant.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <User className="w-5 h-5" />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {otherParticipant?.broker?.name}
                            </p>
                            <p className={`truncate text-xs mt-0.5 ${isUnread ? 'font-bold text-teal-600' : 'text-slate-500'}`}>
                              {lastMsg ? lastMsg.content : 'New conversation'}
                            </p>
                          </div>
                          {isUnread && <div className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0"></div>}
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsMessagesOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-100 text-teal-700 hover:ring-2 ring-teal-500 ring-offset-2 transition-all cursor-pointer border-none outline-none overflow-hidden"
          >
            {user?.broker?.profilePictureUrl ? (
              <img src={user.broker.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
              >
                <div className="py-1">
                  <Link href={`/${user.username}`} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <User className="w-4 h-4 text-slate-400" />
                    Your Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </Link>
                  <div className="h-px bg-slate-200 my-1"></div>
                  <form action={logoutAction}>
                    <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left">
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          </>
        ) : (
          <div className="flex items-center gap-3 ml-2">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
