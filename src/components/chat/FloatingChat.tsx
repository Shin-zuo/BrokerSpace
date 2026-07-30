'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { useChat } from './ChatContext';
import { X, Minus, Maximize2, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ChatWindow({ conversationId, currentUserId }: { conversationId: string, currentUserId: string }) {
  const { closeChat } = useChat();
  const [isMinimized, setIsMinimized] = useState(false);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll every 3 seconds
  const { data: messages, mutate } = useSWR(`/api/conversations/${conversationId}/messages`, fetcher, { refreshInterval: 3000 });
  const { data: convData } = useSWR(`/api/conversations`, fetcher);

  const conversation = convData?.find((c: any) => c.id === conversationId);
  const otherParticipant = conversation 
    ? (conversation.participantOneId === currentUserId ? conversation.participantTwo : conversation.participantOne)
    : null;

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() })
      });
      if (res.ok) {
        setContent('');
        mutate(); // Revalidate immediately
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`w-80 bg-white rounded-t-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-12' : 'h-96'}`}>
      {/* Header */}
      <div 
        className="h-12 bg-teal-600 text-white px-4 py-2 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 font-medium overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-teal-500 overflow-hidden flex items-center justify-center text-sm shrink-0">
            {otherParticipant?.broker?.profilePictureUrl ? (
              <img src={otherParticipant.broker.profilePictureUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              otherParticipant?.broker?.name?.[0] || '?'
            )}
          </div>
          <span className="truncate text-sm">{otherParticipant?.broker?.name || 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-teal-200">
          <button className="hover:text-white p-1 rounded-md transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button 
            className="hover:text-white p-1 rounded-md transition-colors"
            onClick={(e) => { e.stopPropagation(); closeChat(conversationId); }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 bg-slate-50 overflow-y-auto p-4 flex flex-col gap-3">
            {!messages ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Start of conversation
              </div>
            ) : (
              messages.map((msg: any) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'self-end' : 'self-start'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-full px-4 py-2 text-sm transition-all outline-none"
            />
            <button 
              type="submit" 
              disabled={!content.trim() || isSending}
              className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function FloatingChat({ currentUserId }: { currentUserId: string }) {
  const { activeChats } = useChat();

  return (
    <div className="fixed bottom-0 right-6 z-[100] flex items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {activeChats.map((chatId) => (
          <motion.div
            key={chatId}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="pointer-events-auto"
          >
            <ChatWindow conversationId={chatId} currentUserId={currentUserId} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
