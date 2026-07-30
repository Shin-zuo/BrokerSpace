'use client';

import React, { useState } from 'react';
import { MessageSquare, UserPlus, Check, X, Clock, UserCheck } from 'lucide-react';
import useSWR from 'swr';
import { useChat } from '@/src/components/chat/ChatContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProfileActions({ currentUserId, targetUserId, brokerId }: { currentUserId: string, targetUserId: string, brokerId: string }) {
  const { openChat } = useChat();
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: connections, mutate } = useSWR('/api/connections', fetcher);

  const connection = connections?.find((c: any) => 
    (c.requesterId === currentUserId && c.receiverId === targetUserId) ||
    (c.requesterId === targetUserId && c.receiverId === currentUserId)
  );

  const handleMessage = async () => {
    if (isOpeningChat) return;
    setIsOpeningChat(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerId, propertyId: null }) // Using brokerId to start chat
      });
      const data = await res.json();
      if (data && data.id) {
        openChat(data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleConnect = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateConnection = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await fetch(`/api/connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Connection Button */}
      {!connection ? (
        <button 
          onClick={handleConnect}
          disabled={isUpdating}
          className="bg-white hover:bg-slate-50 text-teal-600 border border-teal-200 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Connect
        </button>
      ) : connection.status === 'PENDING' ? (
        connection.requesterId === currentUserId ? (
          <button disabled className="bg-slate-100 text-slate-500 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 border border-slate-200 cursor-not-allowed">
            <Clock className="w-5 h-5" />
            Pending Request
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdateConnection(connection.id, 'ACCEPTED')}
              disabled={isUpdating}
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" /> Accept
            </button>
            <button 
              onClick={() => handleUpdateConnection(connection.id, 'DECLINED')}
              disabled={isUpdating}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )
      ) : connection.status === 'ACCEPTED' ? (
        <button disabled className="bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 border border-emerald-200 cursor-not-allowed">
          <UserCheck className="w-5 h-5" />
          Connected
        </button>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={isUpdating}
          className="bg-white hover:bg-slate-50 text-teal-600 border border-teal-200 px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Reconnect
        </button>
      )}

      {/* Message Button */}
      <button 
        onClick={handleMessage}
        disabled={isOpeningChat}
        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <MessageSquare className="w-5 h-5" />
        Message
      </button>
    </div>
  );
}
