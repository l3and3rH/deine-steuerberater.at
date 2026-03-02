import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface RawEntry {
  name: string;
  adresse: string;
  plz: string;
  stadtSlug: string;
  telefon: string;
  email: string;
  website: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const csvPath = path.join(process.cwd(), "scripts", "steuerberater.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("Missing scripts/steuerberater.csv — create it first.");
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter(Boolean);
  const errors: string[] = [];

  for (const line of lines.slice(1)) { // skip header
    const [name, adresse, plz, stadtSlug, telefon, email, website] = line.split(";").map(s => s.trim());
    const entry: RawEntry = { name, adresse, plz, stadtSlug, telefon, email, website };

    try {
      const stadt = await prisma.stadt.findUnique({ where: { slug: stadtSlug } });
      if (!stadt) {
        errors.push(`Unknown stadtSlug: ${stadtSlug} for ${name}`);
        continue;
      }

      const slug = slugify(name) + "-" + slugify(stadtSlug);

      // Create a placeholder user for imported profiles
      const user = await prisma.user.upsert({
        where: { email: email || `import+${slug}@steuerberater-verzeichnis.at` },
        update: {},
        create: {
          email: email || `import+${slug}@steuerberater-verzeichnis.at`,
          role: "STEUERBERATER",
        },
      });

      const profile = await prisma.steuerberaterProfile.upsert({
        where: { slug },
        update: { adresse, plz, telefon, email, website },
        create: {
          userId: user.id,
          name,
          slug,
          adresse,
          plz,
          telefon,
          email,
          website,
          paket: "BASIC",
        },
      });

      // Link to city
      await prisma.steuerberaterStadt.upsert({
        where: { steuerberaterId_stadtId: { steuerberaterId: profile.id, stadtId: stadt.id } },
        update: {},
        create: { steuerberaterId: profile.id, stadtId: stadt.id },
      });
    } catch (e) {
      errors.push(`Error on ${name}: ${e}`);
    }
  }

  if (errors.length) {
    fs.writeFileSync("import_errors.log", errors.join("\n"));
    console.log(`Done with ${errors.length} errors. See import_errors.log`);
  } else {
    console.log("Import complete, no errors.");
  }
}

main().finally(() => prisma.$disconnect());
