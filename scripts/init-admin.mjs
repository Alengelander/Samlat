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

  // Standard-Kistenarten (IKEA SAMLA) anlegen, falls noch keine vorhanden sind.
  const typeCount = await prisma.boxType.count();
  if (typeCount === 0) {
    await prisma.boxType.createMany({
      data: [
        { name: "SAMLA 5 l", liters: 5, dimensions: "28 x 20 x 14 cm", sortOrder: 5 },
        { name: "SAMLA 11 l", liters: 11, dimensions: "39 x 28 x 14 cm", sortOrder: 11 },
        { name: "SAMLA 22 l", liters: 22, dimensions: "39 x 28 x 28 cm", sortOrder: 22 },
        { name: "SAMLA 45 l", liters: 45, dimensions: "57 x 39 x 28 cm", sortOrder: 45 },
        { name: "SAMLA 55 l", liters: 55, dimensions: "79 x 57 x 18 cm", sortOrder: 55 },
        { name: "SAMLA 65 l", liters: 65, dimensions: "57 x 39 x 42 cm", sortOrder: 65 },
        { name: "SAMLA 130 l", liters: 130, dimensions: "79 x 57 x 43 cm", sortOrder: 130 },
      ],
    });
    console.log("[init-admin] SAMLA-Kistenarten angelegt.");
  }
}

main()
  .catch((e) => {
    console.error("[init-admin] Fehler:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
