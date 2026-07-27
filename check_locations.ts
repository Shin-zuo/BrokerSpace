import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      latitude: true,
      longitude: true
    }
  });
  console.log(properties);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
