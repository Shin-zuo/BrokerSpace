import { PropertyController } from "./src/controllers/propertyController";
import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const props = await PropertyController.getAll();
    console.log("Success:", props);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
