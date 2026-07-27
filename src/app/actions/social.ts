'use server';

import { prisma } from '@/src/lib/prisma';
import { getSession } from '@/src/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleLike(propertyId: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error('Unauthorized');
  }

  const userId = session.userId as string;

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      return { success: true, liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId,
          propertyId,
        }
      });
      
      const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { broker: { include: { user: true } } } });
      if (property?.broker?.user?.id && property.broker.user.id !== userId) {
        await prisma.notification.create({
          data: {
            userId: property.broker.user.id,
            actorId: userId,
            type: 'LIKE',
            propertyId
          }
        });
      }
      
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { success: false, error: 'Failed to toggle like' };
  }
}

export async function toggleSave(propertyId: string) {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new Error('Unauthorized');
  }

  const userId = session.userId as string;

  try {
    const existingSave = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        }
      }
    });

    if (existingSave) {
      await prisma.savedProperty.delete({
        where: { id: existingSave.id }
      });
      return { success: true, saved: false };
    } else {
      await prisma.savedProperty.create({
        data: {
          userId,
          propertyId,
        }
      });
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    return { success: false, error: 'Failed to toggle save' };
  }
}
