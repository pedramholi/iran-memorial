import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const SubmissionSchema = z.object({
  name_latin: z.string().min(1).max(200),
  name_farsi: z.string().max(200).optional(),
  date_of_birth: z.string().max(50).optional(),
  date_of_death: z.string().max(50).optional(),
  place_of_death: z.string().max(200).optional(),
  province: z.string().max(100).optional(),
  cause_of_death: z.string().max(200).optional(),
  details: z.string().min(10).max(5000),
  sources: z.string().max(2000).optional(),
  submitter_email: z.string().email().max(254).optional().nullable(),
  submitter_name: z.string().max(200).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per hour per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success, remaining, resetAt } = rateLimit(ip, "submit", 5, 3600);

    if (!success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Validate input
    const body = await request.json();
    const result = SubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid submission data", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validated = result.data;

    const submission = await prisma.submission.create({
      data: {
        victimData: validated,
        submitterEmail: validated.submitter_email || null,
        submitterName: validated.submitter_name || null,
      },
    });

    return NextResponse.json(
      { id: submission.id, status: "pending" },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
