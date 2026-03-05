import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  // Original fields
  beschreibung: z.string().max(500).optional(),
  telefon: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10).optional(),

  // New fields
  berufsbezeichnung: z.enum(["STEUERBERATER", "WIRTSCHAFTSPRUEFER", "BEIDES", "BUCHHALTER", "BILANZBUCHHALTER"]).optional(),
  kanzleiname: z.string().max(200).optional(),
  bezirk: z.string().max(200).optional(),
  kswMitglied: z.boolean().optional(),
  kswMitgliedsnummer: z.string().max(100).optional(),
  zulassungsjahr: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  ausbildung: z.string().max(1000).optional(),
  auszeichnungen: z.array(z.string()).optional(),
  mitgliedschaften: z.array(z.string()).optional(),
  mandantengruppen: z.array(z.string()).optional(),
  gratisErstgespraech: z.boolean().optional(),
  onlineBeratung: z.boolean().optional(),
  schnellantwort: z.boolean().optional(),
  abendtermine: z.boolean().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  const userId = session.user.id;
  const profile = await prisma.steuerberaterProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  const d = parsed.data;

  // Fields available to all plans
  const updateData: Record<string, unknown> = {
    telefon: d.telefon,
    website: d.website,
    berufsbezeichnung: d.berufsbezeichnung,
    kanzleiname: d.kanzleiname,
    bezirk: d.bezirk,
    kswMitglied: d.kswMitglied,
    kswMitgliedsnummer: d.kswMitgliedsnummer,
    zulassungsjahr: d.zulassungsjahr,
    ausbildung: d.ausbildung,
    auszeichnungen: d.auszeichnungen,
    mitgliedschaften: d.mitgliedschaften,
    mandantengruppen: d.mandantengruppen,
    gratisErstgespraech: d.gratisErstgespraech,
    onlineBeratung: d.onlineBeratung,
    schnellantwort: d.schnellantwort,
    abendtermine: d.abendtermine,
  };

  // Premium-only fields
  if (profile.paket !== "BASIC") {
    updateData.beschreibung = d.beschreibung;
    updateData.tags = d.tags;
  }

  // SEO-only fields
  if (profile.paket === "SEO") {
    updateData.videoUrl = d.videoUrl;
  }

  // Remove undefined keys so Prisma doesn't overwrite with undefined
  Object.keys(updateData).forEach((k) => {
    if (updateData[k] === undefined) delete updateData[k];
  });

  await prisma.steuerberaterProfile.update({ where: { userId }, data: updateData });

  return NextResponse.json({ ok: true });
}
