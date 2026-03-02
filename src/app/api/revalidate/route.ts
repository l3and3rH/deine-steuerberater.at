import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
