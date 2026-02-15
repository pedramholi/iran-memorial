import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  // Auth: require Nginx basic auth header
  const user = request.headers.get("x-forwarded-user");
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const victimId = formData.get("victimId") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!victimId) {
    return NextResponse.json({ error: "victimId required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  // Verify victim exists
  const victim = await prisma.victim.findUnique({ where: { id: victimId }, select: { id: true, slug: true } });
  if (!victim) {
    return NextResponse.json({ error: "Victim not found" }, { status: 404 });
  }

  // Create upload directory
  await mkdir(UPLOAD_DIR, { recursive: true });

  // Generate unique filename
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${victim.slug}-${Date.now()}.${ext}`;
  const filepath = join(UPLOAD_DIR, filename);

  // Write file
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  // Create Photo record
  const existingPhotos = await prisma.photo.count({ where: { victimId } });
  const photo = await prisma.photo.create({
    data: {
      victimId,
      url: `/uploads/${filename}`,
      captionEn: caption || null,
      photoType: "portrait",
      isPrimary: existingPhotos === 0,
      sortOrder: existingPhotos,
    },
  });

  return NextResponse.json({
    id: photo.id,
    url: photo.url,
    isPrimary: photo.isPrimary,
  }, { status: 201 });
}
