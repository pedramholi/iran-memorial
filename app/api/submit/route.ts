import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name_latin || !body.details) {
      return NextResponse.json(
        { error: "Name and details are required" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        victimData: body,
        submitterEmail: body.submitter_email || null,
        submitterName: body.submitter_name || null,
      },
    });

    return NextResponse.json({ id: submission.id, status: "pending" });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
