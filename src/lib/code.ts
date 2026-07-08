import { prisma } from "@/lib/prisma";

// Ohne verwechselbare Zeichen (0/O, 1/I).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

// Erzeugt einen eindeutigen zufaelligen Kisten-Code (Fallback ohne Groesse).
export async function generateUniqueBoxCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await prisma.box.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Konnte keinen eindeutigen Code erzeugen.");
}

// Erzeugt eine Kisten-Nummer, aus der die Groesse ablesbar ist:
//   <liter>-<laufende Nr.>   z.B. "45-001"
// Ohne bekannte Litergroesse wird ein zufaelliger Code vergeben.
export async function generateBoxNumber(liters: number | null | undefined): Promise<string> {
  if (liters == null) return generateUniqueBoxCode();

  const prefix = `${liters}-`;
  const count = await prisma.box.count({ where: { code: { startsWith: prefix } } });
  for (let i = 1; i <= count + 20; i++) {
    const candidate = `${prefix}${String(i).padStart(3, "0")}`;
    const existing = await prisma.box.findUnique({ where: { code: candidate } });
    if (!existing) return candidate;
  }
  throw new Error("Konnte keine Kisten-Nummer erzeugen.");
}
