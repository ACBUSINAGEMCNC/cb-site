import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IGNORED_PREFIXES = ["/admin", "/api", "/_next"];
const BOT_PATTERN = /bot|crawler|spider|headless|pingdom|uptime/i;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
      referrer?: unknown;
    } | null;

    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : null;
    if (!path || !path.startsWith("/")) {
      return new NextResponse(null, { status: 204 });
    }
    if (IGNORED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return new NextResponse(null, { status: 204 });
    }

    const userAgent = request.headers.get("user-agent") ?? "";
    if (BOT_PATTERN.test(userAgent)) {
      return new NextResponse(null, { status: 204 });
    }

    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() ?? "";

    const country = request.headers.get("x-vercel-ip-country");
    const region = request.headers.get("x-vercel-ip-country-region");
    const city = request.headers.get("x-vercel-ip-city");

    // Hash diário de IP+UA: permite contar visitantes únicos sem guardar IP.
    const dayKey = new Date().toISOString().slice(0, 10); // YYYYMMDD base UTC
    const visitor =
      ip || userAgent
        ? createHash("sha256")
            .update(`${ip}|${userAgent}|${dayKey}`)
            .digest("hex")
            .slice(0, 32)
        : null;

    const referrer =
      typeof body?.referrer === "string" && body.referrer
        ? body.referrer.slice(0, 500)
        : null;

    await prisma.pageView.create({
      data: {
        path,
        country: country || null,
        region: region || null,
        city: city || null,
        referrer,
        visitor,
      },
    });
  } catch (error) {
    console.error("track error", error);
  }

  return new NextResponse(null, { status: 204 });
}
