import React from "react";
import Navbar from "@/src/components/layout/Navbar";
import SubscriptionBanner from "@/src/components/subscription/SubscriptionBanner";
import SystemAnnouncementBanner from "@/src/components/system/SystemAnnouncementBanner";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { getSystemSettings } from "@/src/lib/systemSettings";
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

    // Grace Period Auto-Initialization for Existing Production Brokers:
    // If an existing broker doesn't have an expiration date yet, grant 30 days of complimentary active access.
    if (user && user.role !== 'SuperAdmin' && user.broker && !user.broker.subscriptionExpiresAt && user.broker.subscriptionStatus !== 'pending_payment') {
      const graceExpires = new Date();
      graceExpires.setDate(graceExpires.getDate() + 30);

      try {
        await prisma.broker.update({
          where: { id: user.broker.id },
          data: {
            subscriptionStatus: 'active',
            subscriptionExpiresAt: graceExpires,
          },
        });

        user.broker.subscriptionStatus = 'active';
        user.broker.subscriptionExpiresAt = graceExpires;
      } catch (err) {
        console.error('Failed to auto-initialize grace period for broker:', err);
      }
    }
  }

  const settings = await getSystemSettings();

  return (
    <SidebarProvider>
      <ChatProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 pt-16">
          <Navbar user={user} />
          <SystemAnnouncementBanner
            maintenanceMode={settings.maintenance_mode}
            maintenanceMessage={settings.maintenance_message}
            announcementActive={settings.announcement_active}
            announcementBanner={settings.announcement_banner}
          />
          {user?.broker && user?.role !== 'SuperAdmin' && <SubscriptionBanner broker={user.broker} />}
          <main className="w-full h-full">
            {children}
          </main>
          {user && <FloatingChat currentUserId={user.id} />}
        </div>
      </ChatProvider>
    </SidebarProvider>
  );
}
