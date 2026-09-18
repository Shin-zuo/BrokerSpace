'use server';

import { prisma } from '@/src/lib/prisma';
import { sendWelcomeSubscriptionEmail } from '@/src/lib/mail';

/**
 * Server Action for Sandbox / Local Development Mock Payment
 * Simulates a successful Xendit webhook callback:
 * 1. Updates PaymentTransaction to PAID
 * 2. Activates Broker subscription (+30 days or +365 days)
 * 3. Dispatches official invoice & welcome email (or console preview in dev)
 */
export async function simulatePaymentAction(externalId: string, email?: string) {
  try {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { externalId },
      include: {
        broker: {
          include: { user: true },
        },
      },
    });

    if (!transaction) {
      return { success: false, error: `Transaction with external ID "${externalId}" not found.` };
    }

    const paidDate = new Date();
    const expiresAt = new Date(paidDate);
    if (transaction.plan === 'yearly') {
      expiresAt.setDate(expiresAt.getDate() + 365);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    const recipientEmail = email || transaction.payerEmail || transaction.broker.user?.email || transaction.broker.publicEmail;

    // Update Transaction
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'PAID',
        paymentMethod: 'TEST_SANDBOX_SIMULATION',
        paidAt: paidDate,
        payerEmail: recipientEmail,
      },
    });

    // Activate Broker
    await prisma.broker.update({
      where: { id: transaction.brokerId },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: transaction.plan,
        subscriptionExpiresAt: expiresAt,
      },
    });

    // Dispatch Welcome & Invoice Email
    if (recipientEmail) {
      await sendWelcomeSubscriptionEmail({
        to: recipientEmail,
        name: transaction.broker.name,
        plan: transaction.plan as 'monthly' | 'yearly',
        amount: Number(transaction.amount),
        expiresAt,
        invoiceId: transaction.xenditInvoiceId || `mock_inv_${Date.now()}`,
      });
    }

    console.log(`[Sandbox Simulation] Broker ${transaction.brokerId} successfully activated! Valid until: ${expiresAt.toISOString()}`);
    return { success: true };
  } catch (error: any) {
    console.error('[Sandbox Simulation Error]:', error);
    return { success: false, error: error.message || 'Payment simulation failed.' };
  }
}
