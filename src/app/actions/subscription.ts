'use server';

import { getSession } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { createXenditInvoice } from '@/src/lib/xendit';

export interface RenewalResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

/**
 * Generates a Xendit checkout invoice for subscription renewal or plan upgrade
 */
export async function createRenewalInvoiceAction(plan: 'monthly' | 'yearly'): Promise<RenewalResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.brokerId) {
      return { success: false, error: 'You must be logged in to renew your subscription.' };
    }

    const broker = await prisma.broker.findUnique({
      where: { id: session.brokerId as string },
      include: { user: true },
    });

    if (!broker) {
      return { success: false, error: 'Broker account not found.' };
    }

    const amount = plan === 'yearly' ? 4999 : 499;
    const recipientEmail = broker.user?.email || broker.publicEmail;

    if (!recipientEmail) {
      return { success: false, error: 'Please update your email in Profile Settings before renewing.' };
    }

    const externalId = `sub_renew_${broker.id}_${Date.now()}`;
    const invoice = await createXenditInvoice({
      externalId,
      amount,
      payerEmail: recipientEmail,
      description: `BrokerSpace ${plan === 'yearly' ? 'Annual' : 'Monthly'} Subscription Renewal`,
      customerName: broker.name,
      customerPhone: broker.whatsappNumber,
      plan,
    });

    // Record the pending transaction
    await prisma.paymentTransaction.create({
      data: {
        brokerId: broker.id,
        xenditInvoiceId: invoice.id,
        externalId: invoice.external_id,
        amount,
        currency: 'PHP',
        plan,
        status: 'PENDING',
        payerEmail: recipientEmail,
      },
    });

    // Link current invoice ID to broker
    await prisma.broker.update({
      where: { id: broker.id },
      data: { currentInvoiceId: invoice.id },
    });

    return { success: true, redirectUrl: invoice.invoice_url };
  } catch (error: any) {
    console.error('Renewal invoice error:', error);
    return { success: false, error: error.message || 'Failed to initialize renewal checkout.' };
  }
}

/**
 * Fetches subscription details and payment history for the authenticated broker
 */
export async function getBrokerSubscriptionDetailsAction() {
  const session = await getSession();
  if (!session || !session.brokerId) {
    return null;
  }

  const broker = await prisma.broker.findUnique({
    where: { id: session.brokerId as string },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      user: {
        select: { email: true, username: true },
      },
    },
  });

  return broker;
}
