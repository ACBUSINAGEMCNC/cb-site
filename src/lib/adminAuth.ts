import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "cb_admin_session";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createAdminSession(adminUserId: number) {
  const rawToken = createSessionToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

  await prisma.adminSession.create({
    data: {
      tokenHash,
      expiresAt,
      adminUserId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = sha256(token);
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}

export async function requireAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { tokenHash } });
    return null;
  }

  return session.adminUser;
}
