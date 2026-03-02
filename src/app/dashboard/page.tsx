import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const profile = await prisma.steuerberaterProfile.findUnique({
    where: { userId: session.user.id },
    include: { staedte: { include: { stadt: true } } },
  });

  if (!profile) redirect("/auth/login");

  return <DashboardClient profile={JSON.parse(JSON.stringify(profile))} />;
}
