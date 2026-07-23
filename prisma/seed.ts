import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('testPass', 10);

  const testBrokerProfile = await prisma.broker.create({
    data: {
      name: 'Test Broker',
      whatsappNumber: '+639123456789',
      companyName: 'Segovia Real Estate',
      licenseNumber: 'REB-12345',
      bio: 'Experienced real estate broker specializing in luxury properties.',
    }
  });

  const testBrokerUser = await prisma.user.upsert({
    where: { email: 'sample@email.com' },
    update: {
      password: hashedPassword,
      username: 'testBroker',
      brokerId: testBrokerProfile.id
    },
    create: {
      email: 'sample@email.com',
      username: 'testBroker',
      password: hashedPassword,
      role: 'Broker',
      brokerId: testBrokerProfile.id
    },
  });

  console.log(`Seeded user: ${testBrokerUser.username} linked to broker profile ${testBrokerProfile.name}`);
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    // nothing to disconnect since we use adapter, but we can exit
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
