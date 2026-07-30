'use client';

import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Check, X, Clock, UserPlus, Network } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { useChat } from '@/src/components/chat/ChatContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function NetworkView({ currentUserId, initialConnections, suggestions }: { currentUserId: string, initialConnections: any[], suggestions: any[] }) {
  const { data: connections, mutate } = useSWR('/api/connections', fetcher, { fallbackData: initialConnections });
  const { openChat } = useChat();
  const [isUpdating, setIsUpdating] = useState(false);

  const pendingIncoming = connections?.filter((c: any) => c.receiverId === currentUserId && c.status === 'PENDING') || [];
  const pendingOutgoing = connections?.filter((c: any) => c.requesterId === currentUserId && c.status === 'PENDING') || [];
  const activeConnections = connections?.filter((c: any) => c.status === 'ACCEPTED') || [];

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

  const handleConnect = async (targetUserId: string) => {
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

  const handleMessage = async (brokerId: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerId, propertyId: null })
      });
      const data = await res.json();
      if (data && data.id) {
        openChat(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#requests') {
      const el = document.getElementById('pending-requests');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.classList.add('ring-2', 'ring-teal-500', 'ring-offset-2', 'shadow-lg');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-teal-500', 'ring-offset-2', 'shadow-lg');
        }, 3000);
      }
    }
  }, [pendingIncoming.length]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Requests & Network */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Pending Requests */}
        {pendingIncoming.length > 0 && (
          <div id="pending-requests" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-1000">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-teal-500" />
              Pending Requests ({pendingIncoming.length})
            </h2>
            <div className="space-y-4">
              {pendingIncoming.map((conn: any) => (
                <div key={conn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <Link href={`/${conn.requester.username}`} className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-300 transition-all">
                      {conn.requester.broker?.profilePictureUrl ? (
                        <img src={conn.requester.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </Link>
                    <div>
                      <Link href={`/${conn.requester.username}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors">
                        {conn.requester.broker?.name}
                      </Link>
                      <p className="text-sm text-slate-500">{conn.requester.broker?.companyName || 'Independent Broker'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateConnection(conn.id, 'ACCEPTED')}
                      disabled={isUpdating}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => handleUpdateConnection(conn.id, 'DECLINED')}
                      disabled={isUpdating}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 text-sm disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Connections */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">My Connections ({activeConnections.length})</h2>
          {activeConnections.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <Network className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p>You don't have any connections yet.</p>
              <p className="text-sm mt-1">Start connecting with other brokers to build your network.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeConnections.map((conn: any) => {
                const partner = conn.requesterId === currentUserId ? conn.receiver : conn.requester;
                return (
                  <div key={conn.id} className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100 items-center text-center group">
                    <Link href={`/${partner.username}`} className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3 overflow-hidden shadow-sm group-hover:ring-2 ring-teal-300 transition-all cursor-pointer">
                      {partner.broker?.profilePictureUrl ? (
                        <img src={partner.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </Link>
                    <Link href={`/${partner.username}`} className="font-bold text-slate-900 hover:text-teal-600 transition-colors">
                      {partner.broker?.name}
                    </Link>
                    <p className="text-xs text-slate-500 mb-4">{partner.broker?.companyName || 'Independent Broker'}</p>
                    <button 
                      onClick={() => handleMessage(partner.broker.id)}
                      className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Suggestions */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Suggested Brokers</h2>
          <div className="space-y-4">
            {suggestions.filter((s: any) => {
              // Ensure we don't show suggestions for people we already have pending outgoings with
              return !pendingOutgoing.some((p: any) => p.receiverId === s.id);
            }).map((suggestion: any) => (
              <div key={suggestion.id} className="flex items-center gap-3">
                <Link href={`/${suggestion.username}`} className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-teal-300 transition-all">
                  {suggestion.broker?.profilePictureUrl ? (
                    <img src={suggestion.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/${suggestion.username}`} className="font-bold text-sm text-slate-900 truncate hover:text-teal-600 transition-colors cursor-pointer block">
                    {suggestion.broker?.name}
                  </Link>
                  <p className="text-xs text-slate-500 truncate">{suggestion.broker?.companyName || 'Broker'}</p>
                </div>
                <button 
                  onClick={() => handleConnect(suggestion.id)}
                  disabled={isUpdating}
                  className="w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Connect"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {suggestions.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No new suggestions at the moment.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
