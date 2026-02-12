import { NextRequest, NextResponse } from "next/server";
import { searchVictims } from "@/lib/queries";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limit: 100 requests per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = rateLimit(ip, "search", 100, 60);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchVictims(q, limit);
    return NextResponse.json({
      results: results.map((v) => ({
        slug: v.slug,
        nameLatin: v.nameLatin,
        nameFarsi: v.nameFarsi,
        dateOfDeath: v.dateOfDeath,
        placeOfDeath: v.placeOfDeath,
      })),
    });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
