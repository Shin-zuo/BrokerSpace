'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Search, Send, User, Loader2, MessageSquare } from 'lucide-react';
import { useChat } from '@/src/components/chat/ChatContext';
import BackButton from '@/src/components/ui/BackButton';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MessagesPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user (could also use Context, but let's fetch session for simplicity or just rely on API returns)
  const { data: session } = useSWR('/api/auth/session', fetcher);
  const currentUserId = session?.userId;

  const { data: convData, mutate: mutateConv } = useSWR('/api/conversations', fetcher, { refreshInterval: 5000 });
  
  const { data: messages, mutate: mutateMessages } = useSWR(
    activeConversationId ? `/api/conversations/${activeConversationId}/messages` : null, 
    fetcher, 
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = convData?.find((c: any) => c.id === activeConversationId);
  const otherParticipant = activeConversation 
    ? (activeConversation.participantOneId === currentUserId ? activeConversation.participantTwo : activeConversation.participantOne)
    : null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending || !activeConversationId) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });
      if (res.ok) {
        setContent('');
        mutateMessages();
        mutateConv();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)]">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex overflow-hidden">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="mb-2">
              <BackButton />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-slate-100 pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!convData ? (
              <div className="p-8 text-center flex flex-col items-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Loading chats...</p>
              </div>
            ) : convData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No conversations yet. Connect with brokers to start chatting!
              </div>
            ) : (
              convData.map((conv: any) => {
                const partner = conv.participantOneId === currentUserId ? conv.participantTwo : conv.participantOne;
                const lastMsg = conv.messages?.[0];
                const isActive = activeConversationId === conv.id;
                const isUnread = lastMsg && !lastMsg.isRead && lastMsg.senderId !== currentUserId;

                return (
                  <button 
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full p-4 flex gap-3 text-left transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-100 ${isActive ? 'bg-indigo-50 hover:bg-indigo-50' : 'bg-white'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden relative">
                      {partner?.broker?.profilePictureUrl ? (
                        <img src={partner.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`truncate font-semibold ${isUnread && !isActive ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {partner?.broker?.name}
                        </h3>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {new Date(lastMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`truncate text-sm ${isUnread && !isActive ? 'font-bold text-indigo-600' : 'text-slate-500'}`}>
                        {lastMsg ? (lastMsg.senderId === currentUserId ? `You: ${lastMsg.content}` : lastMsg.content) : 'Start a conversation'}
                      </p>
                    </div>
                    {isUnread && !isActive && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 self-center"></div>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversationId && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-4 bg-white shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center overflow-hidden">
                  {otherParticipant.broker?.profilePictureUrl ? (
                    <img src={otherParticipant.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{otherParticipant.broker?.name}</h2>
                  {otherParticipant.broker?.companyName && (
                    <p className="text-xs text-slate-500">{otherParticipant.broker.companyName}</p>
                  )}
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
                {!messages ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>Start your conversation with {otherParticipant.broker?.name}</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end' : 'self-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'self-end pr-1' : 'self-start pl-1'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input 
                    type="text" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!content.trim() || isSending}
                    className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Your Messages</h2>
              <p className="text-sm">Select a conversation from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
