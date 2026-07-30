'use client';

import React, { useState } from 'react';
import { useChat } from '@/src/components/chat/ChatContext';
import { Loader2 } from 'lucide-react';

export default function MessageBrokerButton({ brokerId, propertyId }: { brokerId: string, propertyId: string }) {
  const { openChat } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  const handleMessage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerId, propertyId })
      });
      const data = await res.json();
      if (data && data.id) {
        openChat(data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMessage}
      disabled={isLoading}
      className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors mt-4 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Message Broker'}
    </button>
  );
}
