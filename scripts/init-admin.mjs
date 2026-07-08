// Legt den Admin-Benutzer aus ADMIN_USERNAME / ADMIN_PASSWORD an bzw.
// aktualisiert dessen Passwort. Wird beim Container-Start ausgefuehrt.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn("[init-admin] ADMIN_USERNAME/ADMIN_PASSWORD nicht gesetzt — uebersprungen.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`[init-admin] Benutzer "${username}" bereit.`);
}

main()
  .catch((e) => {
    console.error("[init-admin] Fehler:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
