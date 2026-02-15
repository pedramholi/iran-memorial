import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ADMIN_USERS = (process.env.ADMIN_USERS || "admin").split(",").map((u) => u.trim());

// Admin auth via Nginx basic auth header — only allowlisted users
function isAdmin(request: NextRequest): boolean {
  const user = request.headers.get("x-forwarded-user");
  return !!user && ADMIN_USERS.includes(user);
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "pending"]),
  reviewerNotes: z.string().max(2000).optional(),
});

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
  const parsed = PatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { id, status, reviewerNotes } = parsed.data;
  const user = request.headers.get("x-forwarded-user") || "admin";

  try {
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
  } catch {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
}
