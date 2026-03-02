import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

const BASE_URL = "https://steuerberater-verzeichnis.at";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staedte = await prisma.stadt.findMany({ select: { slug: true } });
  const profiles = await prisma.steuerberaterProfile.findMany({
    select: { slug: true, staedte: { select: { stadt: { select: { slug: true } } } } },
  });

  const stadtUrls = staedte.map((s) => ({
    url: `${BASE_URL}/steuerberater/${s.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const profileUrls = profiles.flatMap((p) =>
    p.staedte.map((s) => ({
      url: `${BASE_URL}/steuerberater/${s.stadt.slug}/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    ...stadtUrls,
    ...profileUrls,
  ];
}
