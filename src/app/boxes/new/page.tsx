import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createBoxAction } from "@/lib/actions";
import { BoxForm } from "@/components/box-form";

export default async function NewBoxPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Neue Kiste anlegen</h1>
      <div className="card">
        <BoxForm action={createBoxAction} submitLabel="Kiste anlegen" />
      </div>
      <p className="text-sm text-slate-500">
        Nach dem Anlegen erhältst du einen QR-Code zum Ausdrucken.
      </p>
    </div>
  );
}
