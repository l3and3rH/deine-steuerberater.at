import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const contactSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(2).max(100),
  email: z.email(),
  message: z.string().min(10).max(2000),
  datenschutz: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    // TODO: Send email to profile owner in production
    console.log("Contact request:", data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Daten", details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
