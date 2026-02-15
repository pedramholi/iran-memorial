import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Simple admin auth via header (Nginx basic auth passes X-Forwarded-User)
function isAdmin(request: NextRequest): boolean {
  const user = request.headers.get("x-forwarded-user");
  return !!user; // Any authenticated user via Nginx basic auth
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") || "pending";

  const submissions = await prisma.submission.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ submissions });
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, reviewerNotes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const user = request.headers.get("x-forwarded-user") || "admin";

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      status,
      reviewerNotes: reviewerNotes || null,
      reviewedBy: user,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ submission: updated });
}
