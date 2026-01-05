import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/adminAuth";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const passwordHash = sha256(password);
  const a = Buffer.from(admin.passwordHash);
  const b = Buffer.from(passwordHash);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await createAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
