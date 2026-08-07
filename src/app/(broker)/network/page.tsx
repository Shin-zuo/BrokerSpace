import React from 'react';
import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import NetworkView from './NetworkView';
import BackButton from '@/src/components/ui/BackButton';

export default async function NetworkPage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect('/login');
  }

  const currentUserId = session.userId as string;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { requesterId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    include: {
      requester: { include: { broker: true } },
      receiver: { include: { broker: true } }
    }
  });

  const connectedUserIds = [currentUserId, ...connections.flatMap(c => [c.requesterId, c.receiverId])];

  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: connectedUserIds },
    },
    include: { broker: true },
    take: 10
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <NetworkView 
        currentUserId={currentUserId} 
        initialConnections={connections} 
        suggestions={suggestions} 
      />
    </div>
  );
}
