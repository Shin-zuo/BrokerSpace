'use server';

import { destroySession, createSession } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createXenditInvoice } from '@/src/lib/xendit';

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const contactNumber = formData.get('contactNumber') as string;
  const companyName = formData.get('companyName') as string;
  const licenseNumber = formData.get('licenseNumber') as string;
  const facebookUrl = formData.get('facebookUrl') as string;
  const linkedinUrl = formData.get('linkedinUrl') as string;
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const subscriptionPlan = (formData.get('subscriptionPlan') as string) === 'yearly' ? 'yearly' : 'monthly';

  if (!name || !whatsappNumber || !username || !email || !password) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

  // Global Registration Killswitch check
  const { getSystemSettings } = await import('@/src/lib/systemSettings');
  const settings = await getSystemSettings();
  if (!settings.global_registration_enabled || settings.maintenance_mode) {
    return {
      success: false,
      error: 'New broker registrations are temporarily closed for scheduled maintenance. Please check back shortly.',
    };
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please provide a valid email address to receive your official invoice and welcome message.' };
  }

  const amount = subscriptionPlan === 'yearly' ? 4999 : 499;

  let invoiceUrl = '';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return { success: false, error: 'Username or email already exists.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Broker and User with pending_payment status
    const { newUser, newBroker } = await prisma.$transaction(async (tx) => {
      const broker = await tx.broker.create({
        data: {
          name,
          whatsappNumber,
          contactNumber: contactNumber || null,
          companyName: companyName || null,
          licenseNumber: licenseNumber || null,
          facebookUrl: facebookUrl || null,
          linkedinUrl: linkedinUrl || null,
          subscriptionPlan,
          subscriptionStatus: 'pending_payment',
          maxListings: settings.default_max_listings ?? 50,
        }
      });

      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'Broker',
          brokerId: broker.id
        }
      });

      return { newUser: user, newBroker: broker };
    });

    // 2. Initialize Xendit Invoice
    const externalId = `sub_${newBroker.id}_${Date.now()}`;
    const invoice = await createXenditInvoice({
      externalId,
      amount,
      payerEmail: email,
      description: `BrokerSpace ${subscriptionPlan === 'yearly' ? 'Annual' : 'Monthly'} Membership`,
      customerName: name,
      customerPhone: whatsappNumber,
      plan: subscriptionPlan,
    });

    invoiceUrl = invoice.invoice_url;

    // 3. Save PaymentTransaction record
    await prisma.paymentTransaction.create({
      data: {
        brokerId: newBroker.id,
        xenditInvoiceId: invoice.id,
        externalId: invoice.external_id,
        amount,
        currency: 'PHP',
        plan: subscriptionPlan,
        status: 'PENDING',
        payerEmail: email,
      }
    });

    // Link current invoice ID to broker
    await prisma.broker.update({
      where: { id: newBroker.id },
      data: { currentInvoiceId: invoice.id }
    });

    // 4. Create user session
    await createSession(newUser.id, newUser.role, newUser.brokerId);
    
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false, error: error.message || 'An unexpected error occurred during registration.' };
  }

  // Return the Xendit checkout URL for client-side redirection
  return { success: true, redirectUrl: invoiceUrl };
}
