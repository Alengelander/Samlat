import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const type = await prisma.boxType.findUnique({
    where: { id },
    select: { image: true, imageType: true },
  });

  if (!type?.image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(Buffer.from(type.image), {
    headers: {
      "Content-Type": type.imageType ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    },
  });
}
