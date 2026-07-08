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

// Erzeugt einen eindeutigen Kisten-Code.
export async function generateUniqueBoxCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await prisma.box.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Konnte keinen eindeutigen Code erzeugen.");
}
