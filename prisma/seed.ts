import { PrismaClient } from "@prisma/client";
import { parse } from "yaml";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const DATA_DIR = join(__dirname, "..", "data");

function readYaml(filePath: string): any {
  const content = readFileSync(filePath, "utf-8");
  return parse(content);
}

function findYamlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findYamlFiles(fullPath));
    } else if (entry.endsWith(".yaml") && !entry.startsWith("_")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function seedEvents() {
  const timelinePath = join(DATA_DIR, "events", "timeline.yaml");
  const events = readYaml(timelinePath);

  console.log(`Seeding ${events.length} events...`);

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.id },
      update: {},
      create: {
        slug: e.id,
        dateStart: new Date(e.date_start),
        dateEnd: e.date_end ? new Date(e.date_end) : null,
        titleEn: e.title_en,
        titleFa: e.title_fa || null,
        titleDe: null,
        descriptionEn: e.description || null,
        descriptionFa: null,
        descriptionDe: null,
        estimatedKilledLow: e.estimated_killed_low || e.estimated_killed || null,
        estimatedKilledHigh: e.estimated_killed_high || null,
        tags: e.tags || [],
      },
    });
    console.log(`  ✓ ${e.id}`);
  }
}

// Map event context text to event slugs
const EVENT_CONTEXT_MAP: Record<string, string> = {
  "Arrest by Guidance Patrol": "woman-life-freedom-2022",
  "Woman, Life, Freedom": "woman-life-freedom-2022",
  "2022 Mahsa Amini protests": "woman-life-freedom-2022",
  "2009 Green Movement": "green-movement-2009",
  "Post-election protests": "green-movement-2009",
  "1988 Prison Massacres": "massacre-1988",
  "کشتار ۶۷": "massacre-1988",
};

function guessEventSlug(victim: any): string | null {
  const context = victim.event_context || "";
  for (const [key, slug] of Object.entries(EVENT_CONTEXT_MAP)) {
    if (context.toLowerCase().includes(key.toLowerCase())) {
      return slug;
    }
  }
  return null;
}

async function seedVictims() {
  const victimsDir = join(DATA_DIR, "victims");
  const yamlFiles = findYamlFiles(victimsDir);

  console.log(`\nSeeding ${yamlFiles.length} victims...`);

  for (const filePath of yamlFiles) {
    const v = readYaml(filePath);
    if (!v || !v.id) {
      console.log(`  ⚠ Skipping ${filePath} (no id)`);
      continue;
    }

    // Find related event
    const eventSlug = guessEventSlug(v);
    let eventId: string | null = null;
    if (eventSlug) {
      const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
      if (event) eventId = event.id;
    }

    const victim = await prisma.victim.upsert({
      where: { slug: v.id },
      update: {},
      create: {
        slug: v.id,
        nameLatin: v.name_latin,
        nameFarsi: v.name_farsi || null,
        aliases: v.aliases || [],
        dateOfBirth: v.date_of_birth ? new Date(v.date_of_birth) : null,
        placeOfBirth: v.place_of_birth || null,
        gender: v.gender || "unknown",
        ethnicity: v.ethnicity || null,
        religion: v.religion || null,
        photoUrl: v.photo || null,
        occupationEn: v.occupation || null,
        occupationFa: null,
        education: v.education || null,
        familyInfo: v.family || null,
        dreamsEn: typeof v.dreams === "string" ? v.dreams.trim() : null,
        dreamsFa: null,
        beliefsEn: typeof v.beliefs === "string" ? v.beliefs.trim() : null,
        beliefsFa: null,
        personalityEn: typeof v.personality === "string" ? v.personality.trim() : null,
        personalityFa: null,
        quotes: v.quotes || [],
        dateOfDeath: v.date_of_death ? new Date(v.date_of_death) : null,
        ageAtDeath: v.age_at_death || null,
        placeOfDeath: v.place_of_death || null,
        province: null,
        causeOfDeath: v.cause_of_death || null,
        circumstancesEn: typeof v.circumstances === "string" ? v.circumstances.trim() : null,
        circumstancesFa: null,
        eventId,
        responsibleForces: typeof v.responsible_forces === "string" ? v.responsible_forces.trim() : null,
        burialLocation: v.burial?.location || null,
        burialDate: v.burial?.date ? new Date(v.burial.date) : null,
        burialCircumstancesEn: typeof v.burial?.circumstances === "string" ? v.burial.circumstances.trim() : null,
        burialCircumstancesFa: null,
        familyPersecutionEn: typeof v.family_persecution === "string" ? v.family_persecution.trim() : null,
        familyPersecutionFa: null,
        legalProceedings: typeof v.legal_proceedings === "string" ? v.legal_proceedings.trim() : null,
        tributes: v.tributes || [],
        verificationStatus: v.status || "unverified",
      },
    });

    // Seed sources
    if (v.sources && Array.isArray(v.sources)) {
      for (const source of v.sources) {
        if (!source.name) continue;
        await prisma.source.create({
          data: {
            victimId: victim.id,
            url: source.url || null,
            name: source.name,
            sourceType: source.type || null,
            publishedDate: source.date ? new Date(source.date) : null,
          },
        });
      }
    }

    console.log(`  ✓ ${v.id} (${v.name_latin})`);
  }
}

async function main() {
  console.log("🕯 Iran Memorial — Database Seed\n");

  await seedEvents();
  await seedVictims();

  console.log("\n✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
