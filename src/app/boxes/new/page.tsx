import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBoxAction } from "@/lib/actions";
import { BoxForm } from "@/components/box-form";

export const dynamic = "force-dynamic";

export default async function NewBoxPage() {
  await requireSession();
  const boxTypes = await prisma.boxType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Neue Kiste anlegen</h1>
      <div className="card">
        <BoxForm action={createBoxAction} submitLabel="Kiste anlegen" boxTypes={boxTypes} />
      </div>
      <p className="text-sm text-slate-500">
        Nach dem Anlegen erhältst du einen QR-Code zum Ausdrucken.
      </p>
    </div>
  );
}
