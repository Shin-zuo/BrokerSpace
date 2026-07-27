'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
  activeChats: string[];
  openChat: (conversationId: string) => void;
  closeChat: (conversationId: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChats, setActiveChats] = useState<string[]>([]);

  const openChat = (conversationId: string) => {
    setActiveChats((prev) => {
      if (prev.includes(conversationId)) return prev;
      return [...prev, conversationId]; // keep all open, or maybe limit to last 3
    });
  };

  const closeChat = (conversationId: string) => {
    setActiveChats((prev) => prev.filter((id) => id !== conversationId));
  };

  return (
    <ChatContext.Provider value={{ activeChats, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
