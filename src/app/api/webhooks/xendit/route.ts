import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifyXenditCallbackToken } from '@/src/lib/xendit';
import { sendWelcomeSubscriptionEmail } from '@/src/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get('x-callback-token');

    // 1. Verify token authenticity
    if (!verifyXenditCallbackToken(callbackToken)) {
      console.warn('[Xendit Webhook] Unauthorized request rejected: Invalid callback token.');
      return NextResponse.json({ error: 'Unauthorized callback token' }, { status: 401 });
    }

    const payload = await req.json();
    const { id: xenditInvoiceId, external_id, status, paid_at, payment_method, payer_email } = payload;

    console.log(`[Xendit Webhook] Received event for invoice ${xenditInvoiceId} (${external_id}), status: ${status}`);

    // 2. Find associated transaction
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { externalId: external_id },
          { xenditInvoiceId: xenditInvoiceId }
        ]
      },
      include: {
        broker: {
          include: { user: true }
        }
      }
    });

    if (!transaction) {
      console.warn(`[Xendit Webhook] No matching transaction found for invoice ${xenditInvoiceId} / external_id ${external_id}`);
      return NextResponse.json({ received: true, warning: 'Transaction not found' }, { status: 200 });
    }

    // 3. Handle Paid status
    if (status === 'PAID' || status === 'SETTLED') {
      const paidDate = paid_at ? new Date(paid_at) : new Date();
      
      // Calculate expiration date (+30 days for monthly, +365 days for annual)
      const expiresAt = new Date(paidDate);
      if (transaction.plan === 'yearly') {
        expiresAt.setDate(expiresAt.getDate() + 365);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      // Update transaction
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PAID',
          paymentMethod: payment_method || null,
          paidAt: paidDate,
          payerEmail: payer_email || transaction.payerEmail,
        }
      });

      // Activate broker subscription
      await prisma.broker.update({
        where: { id: transaction.brokerId },
        data: {
          subscriptionStatus: 'active',
          subscriptionPlan: transaction.plan,
          subscriptionExpiresAt: expiresAt,
        }
      });

      // Send branded Welcome & Invoice confirmation email
      const recipientEmail = payer_email || transaction.payerEmail || transaction.broker.user?.email || transaction.broker.publicEmail;
      if (recipientEmail) {
        await sendWelcomeSubscriptionEmail({
          to: recipientEmail,
          name: transaction.broker.name,
          plan: transaction.plan as 'monthly' | 'yearly',
          amount: Number(transaction.amount),
          expiresAt,
          invoiceId: xenditInvoiceId,
        });
      }

      console.log(`[Xendit Webhook] Broker ${transaction.brokerId} successfully activated! Expires: ${expiresAt.toISOString()}`);
    } else if (status === 'EXPIRED') {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'EXPIRED' }
      });
      console.log(`[Xendit Webhook] Invoice ${xenditInvoiceId} marked as EXPIRED.`);
    }

    return NextResponse.json({ received: true, status });
  } catch (error: any) {
    console.error('[Xendit Webhook] Error processing callback:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
