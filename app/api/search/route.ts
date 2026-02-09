import { NextRequest, NextResponse } from "next/server";
import { searchVictims } from "@/lib/queries";

export async function GET(request: NextRequest) {
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
