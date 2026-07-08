import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getBoxSize } from "@/lib/box-sizes";

const MM = 2.834645669; // mm -> pt

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const box = await prisma.box.findUnique({ where: { code } });
  if (!box) return new NextResponse("Not found", { status: 404 });

  const appUrl = process.env.APP_URL ?? "";
  const boxUrl = `${appUrl}/b/${box.code}`;
  const qrPng = await QRCode.toBuffer(boxUrl, { margin: 0, width: 300 });

  // Etikett 62 x 40 mm (gaengiges Format, spaeter anpassbar).
  const width = 62 * MM;
  const height = 40 * MM;
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([width, height]);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdf.embedPng(qrPng);

  const pad = 3 * MM;
  const qrSize = height - 2 * pad;
  page.drawImage(qrImage, { x: pad, y: pad, width: qrSize, height: qrSize });

  const textX = pad + qrSize + 3 * MM;
  const size = getBoxSize(box.size);
  const black = rgb(0.1, 0.1, 0.1);
  const gray = rgb(0.4, 0.4, 0.4);

  const name = box.name.length > 22 ? box.name.slice(0, 21) + "…" : box.name;
  page.drawText(name, { x: textX, y: height - pad - 10, size: 11, font: fontBold, color: black });
  page.drawText(box.code, { x: textX, y: height - pad - 26, size: 14, font: fontBold, color: rgb(0.18, 0.34, 0.84) });
  page.drawText(`${size.label} (${size.key})`, { x: textX, y: height - pad - 40, size: 8, font, color: gray });
  if (box.location) {
    const loc = box.location.length > 24 ? box.location.slice(0, 23) + "…" : box.location;
    page.drawText(loc, { x: textX, y: height - pad - 52, size: 8, font, color: gray });
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="etikett-${box.code}.pdf"`,
    },
  });
}
