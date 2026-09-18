import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@brokerspace.com';
  const rawPassword = 'testPass';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  console.log(`🔐 Seeding SuperAdmin account: ${email}...`);

  const existingUser = await prisma.user.findFirst({
    where: { email },
    include: { broker: true },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password: hashedPassword,
        role: 'SuperAdmin',
        isSuspended: false,
      },
    });

    if (existingUser.brokerId) {
      await prisma.broker.update({
        where: { id: existingUser.brokerId },
        data: {
          subscriptionStatus: 'active',
          subscriptionPlan: 'lifetime',
          subscriptionExpiresAt: null,
          isVerified: true,
          canPostListings: true,
          canMessage: true,
          maxListings: 9999,
        },
      });
    }

    console.log(`✅ SuperAdmin account updated successfully:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${rawPassword}`);
    console.log(`   Role: SuperAdmin`);
    return;
  }

  // Create broker profile for admin
  const broker = await prisma.broker.create({
    data: {
      name: 'System SuperAdmin',
      whatsappNumber: '9000000000',
      companyName: 'BrokerSpace HQ',
      specialization: 'Platform Administration',
      subscriptionPlan: 'lifetime',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: null,
      isVerified: true,
      canPostListings: true,
      canMessage: true,
      maxListings: 9999,
    },
  });

  // Create user
  await prisma.user.create({
    data: {
      username: 'superadmin',
      email,
      password: hashedPassword,
      role: 'SuperAdmin',
      brokerId: broker.id,
      isSuspended: false,
    },
  });

  console.log(`✅ SuperAdmin account created successfully:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${rawPassword}`);
  console.log(`   Username: superadmin`);
  console.log(`   Role: SuperAdmin`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
