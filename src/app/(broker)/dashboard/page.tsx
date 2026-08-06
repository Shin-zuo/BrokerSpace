import React from "react";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import BackButton from "@/src/components/ui/BackButton";
import DashboardAnalytics from "@/src/components/dashboard/DashboardAnalytics";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  const userId = session.userId as string;

  // Fetch the broker data associated with this user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      broker: true
    }
  });

  if (!user || !user.broker) {
    // If not a broker, redirect somewhere safe or show an error
    redirect("/");
  }

  // Fetch all properties of the broker to compute analytics
  const properties = await prisma.property.findMany({
    where: { brokerId: user.broker.id },
    include: {
      likes: true,
      saves: true
    },
    orderBy: { createdAt: 'asc' } // oldest first for year extraction
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="mb-2">
        <BackButton />
      </div>
      <DashboardAnalytics properties={properties} />
    </div>
  );
}
