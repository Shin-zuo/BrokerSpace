import { prisma } from './src/lib/prisma';

async function main() {
  console.log('Deleting all messages...');
  await prisma.message.deleteMany();
  console.log('Deleting all conversations...');
  await prisma.conversation.deleteMany();
  console.log('Chats cleaned successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
