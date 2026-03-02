import { PrismaClient } from "@prisma/client";
import staedte from "./staedte.json";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${staedte.length} cities...`);
  for (const stadt of staedte) {
    await prisma.stadt.upsert({
      where: { slug: stadt.slug },
      update: {},
      create: {
        name: stadt.name,
        slug: stadt.slug,
        bundesland: stadt.bundesland,
        einleitungstext: `Finden Sie den passenden Steuerberater in ${stadt.name}. Vergleichen Sie lokale Kanzleien und nehmen Sie direkt Kontakt auf.`,
      },
    });
  }
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
