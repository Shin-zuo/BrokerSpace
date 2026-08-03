import React from "react";
import Navbar from "@/src/components/layout/Navbar";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { ChatProvider } from "@/src/components/chat/ChatContext";
import FloatingChat from "@/src/components/chat/FloatingChat";
import { SidebarProvider } from "@/src/components/layout/SidebarContext";

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  let user = null;
  if (session && session.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      include: { broker: true }
    });
  }

  return (
    <SidebarProvider>
      <ChatProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 pt-16">
          <Navbar user={user} />
          <main className="w-full h-full">
            {children}
          </main>
          {user && <FloatingChat currentUserId={user.id} />}
        </div>
      </ChatProvider>
    </SidebarProvider>
  );
}
