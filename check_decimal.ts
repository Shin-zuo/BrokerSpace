import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({
    where: { latitude: { not: null } },
    take: 1
  });
  
  if (properties.length > 0) {
    const lat = properties[0].latitude;
    console.log("Decimal object:", lat);
    console.log("Number():", Number(lat));
    console.log("toNumber():", lat?.toNumber ? lat.toNumber() : "No toNumber");
  } else {
    console.log("No properties with latitude found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
