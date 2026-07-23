const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('testPass', 10);

  const testBroker = await prisma.user.upsert({
    where: { email: 'sample@email.com' },
    update: {
      password: hashedPassword,
      username: 'testBroker',
      name: 'Test Broker'
    },
    create: {
      email: 'sample@email.com',
      username: 'testBroker',
      name: 'Test Broker',
      password: hashedPassword,
      whatsappNumber: '+639123456789',
      role: 'Broker',
    },
  });

  console.log(`Seeded user: ${testBroker.username}`);
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
