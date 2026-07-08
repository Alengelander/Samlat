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

  // Standard-Kistenarten anlegen, falls noch keine vorhanden sind.
  const typeCount = await prisma.boxType.count();
  if (typeCount === 0) {
    await prisma.boxType.createMany({
      data: [
        { name: "Klein", dimensions: "30 x 20 x 15 cm", sortOrder: 1 },
        { name: "Mittel", dimensions: "40 x 30 x 25 cm", sortOrder: 2 },
        { name: "Groß", dimensions: "60 x 40 x 35 cm", sortOrder: 3 },
        { name: "Sehr groß", dimensions: "80 x 50 x 45 cm", sortOrder: 4 },
      ],
    });
    console.log("[init-admin] Standard-Kistenarten angelegt.");
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
