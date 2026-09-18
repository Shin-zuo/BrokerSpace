'use server';

import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Asserts that the caller is authenticated as a SuperAdmin
 */
async function assertSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'SuperAdmin') {
    throw new Error('Unauthorized: SuperAdmin privileges required.');
  }
  return session;
}

/**
 * Retrieves aggregate platform statistics for the SuperAdmin KPI cards
 */
export async function getAdminDashboardStatsAction() {
  await assertSuperAdmin();

  const now = new Date();

  const [
    totalUsers,
    totalBrokers,
    activeSubscriptions,
    pendingSubscriptions,
    totalProperties,
    suspendedUsers,
    verifiedBrokers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.broker.count(),
    prisma.broker.count({
      where: {
        subscriptionStatus: 'active',
        OR: [
          { subscriptionExpiresAt: null },
          { subscriptionExpiresAt: { gte: now } },
        ],
      },
    }),
    prisma.broker.count({
      where: { subscriptionStatus: 'pending_payment' },
    }),
    prisma.property.count({
      where: { deletedAt: null },
    }),
    prisma.user.count({
      where: { isSuspended: true },
    }),
    prisma.broker.count({
      where: { isVerified: true },
    }),
  ]);

  return {
    totalUsers,
    totalBrokers,
    activeSubscriptions,
    pendingSubscriptions,
    totalProperties,
    suspendedUsers,
    verifiedBrokers,
  };
}

export interface AdminUsersFilter {
  search?: string;
  role?: string;
  subscriptionStatus?: string;
  isSuspended?: string; // 'all' | 'true' | 'false'
  page?: number;
  pageSize?: number;
}

/**
 * Retrieves paginated list of users with their broker profile, permissions, and listing stats
 */
export async function getAdminUsersAction(filters: AdminUsersFilter = {}) {
  await assertSuperAdmin();

  const {
    search = '',
    role,
    subscriptionStatus,
    isSuspended,
    page = 1,
    pageSize = 20,
  } = filters;

  const whereClause: any = {};

  if (search.trim()) {
    const term = search.trim();
    whereClause.OR = [
      { username: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { broker: { name: { contains: term, mode: 'insensitive' } } },
      { broker: { companyName: { contains: term, mode: 'insensitive' } } },
      { broker: { licenseNumber: { contains: term, mode: 'insensitive' } } },
    ];
  }

  if (role && (role === 'Broker' || role === 'SuperAdmin')) {
    whereClause.role = role;
  }

  if (isSuspended === 'true') {
    whereClause.isSuspended = true;
  } else if (isSuspended === 'false') {
    whereClause.isSuspended = false;
  }

  if (subscriptionStatus && subscriptionStatus !== 'all') {
    whereClause.broker = {
      ...(whereClause.broker || {}),
      subscriptionStatus,
    };
  }

  const [totalCount, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      include: {
        broker: {
          include: {
            _count: {
              select: {
                properties: { where: { deletedAt: null } },
                payments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
    users,
  };
}

export interface UpdateUserPermissionsInput {
  userId: string;
  role?: 'Broker' | 'SuperAdmin';
  isSuspended?: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string | null;
  maxListings?: number;
  canPostListings?: boolean;
  canMessage?: boolean;
  isVerified?: boolean;
}

/**
 * Updates a user's role, account status, subscription, and granular permissions
 */
export async function updateUserPermissionsAction(input: UpdateUserPermissionsInput) {
  const currentSession = await assertSuperAdmin();

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { broker: true },
  });

  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  // Safety check: Prevent SuperAdmin from suspending their own active session
  if (currentSession.userId === input.userId && input.isSuspended === true) {
    return { success: false, error: 'You cannot suspend your own SuperAdmin account.' };
  }

  // 1. Update User Record
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: input.role ?? user.role,
      isSuspended: input.isSuspended ?? user.isSuspended,
    },
  });

  // 2. Update Broker Record if linked
  if (user.brokerId) {
    const brokerData: any = {};

    if (input.role === 'SuperAdmin') {
      brokerData.subscriptionStatus = 'active';
      brokerData.subscriptionPlan = 'lifetime';
      brokerData.subscriptionExpiresAt = null;
    } else {
      if (input.subscriptionStatus !== undefined) {
        brokerData.subscriptionStatus = input.subscriptionStatus;
      }

      if (input.subscriptionPlan !== undefined) {
        brokerData.subscriptionPlan = input.subscriptionPlan;
      }

      if (input.subscriptionExpiresAt !== undefined) {
        brokerData.subscriptionExpiresAt = input.subscriptionExpiresAt
          ? new Date(input.subscriptionExpiresAt)
          : null;
      }
    }

    if (input.maxListings !== undefined) {
      brokerData.maxListings = Number(input.maxListings);
    }

    if (input.canPostListings !== undefined) {
      brokerData.canPostListings = Boolean(input.canPostListings);
    }

    if (input.canMessage !== undefined) {
      brokerData.canMessage = Boolean(input.canMessage);
    }

    if (input.isVerified !== undefined) {
      brokerData.isVerified = Boolean(input.isVerified);
    }

    if (Object.keys(brokerData).length > 0) {
      await prisma.broker.update({
        where: { id: user.brokerId },
        data: brokerData,
      });
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  return { success: true };
}

/**
 * Retrieves global system settings
 */
export async function getSystemSettingsAction() {
  await assertSuperAdmin();
  const { getSystemSettings } = await import('@/src/lib/systemSettings');
  return await getSystemSettings();
}

/**
 * Updates global system settings
 */
export async function updateSystemSettingsAction(
  partialSettings: Record<string, any>,
  applyToExistingBrokers: boolean = false
) {
  await assertSuperAdmin();

  const upserts = Object.entries(partialSettings).map(([key, value]) => {
    return prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  });

  await prisma.$transaction(upserts);

  if (applyToExistingBrokers && partialSettings.default_max_listings !== undefined) {
    const newQuota = Number(partialSettings.default_max_listings);
    await prisma.broker.updateMany({
      where: {
        user: {
          role: { not: 'SuperAdmin' },
        },
      },
      data: {
        maxListings: newQuota,
      },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/users');
  revalidatePath('/admin/system');
  revalidatePath('/admin/settings');
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Changes SuperAdmin password
 */
export async function changeAdminPasswordAction(currentPassword: string, newPassword: string) {
  const session = await assertSuperAdmin();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  const bcrypt = await import('bcryptjs');
  const isValid = await bcrypt.default.compare(currentPassword, user.password);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const hashedPassword = await bcrypt.default.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true };
}
