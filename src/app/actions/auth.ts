'use server';

import { destroySession, createSession } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

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
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !whatsappNumber || !username || !email || !password) {
    return { success: false, error: 'Please fill in all required fields.' };
  }

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

    // Create Broker and User in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const broker = await tx.broker.create({
        data: {
          name,
          whatsappNumber,
          contactNumber: contactNumber || null,
          companyName: companyName || null,
          licenseNumber: licenseNumber || null,
          facebookUrl: facebookUrl || null,
          linkedinUrl: linkedinUrl || null,
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

      return user;
    });

    // Create session and log them in
    await createSession(newUser.id, newUser.role, newUser.brokerId);
    
  } catch (error: any) {
    console.error("Signup error:", error);
    return { success: false, error: 'An unexpected error occurred during signup.' };
  }
  
  redirect('/feed');
}
