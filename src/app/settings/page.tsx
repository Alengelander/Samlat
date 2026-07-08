import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BoxTypeForm } from "@/components/box-type-form";
import { DeleteBoxTypeButton } from "@/components/delete-buttons";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSession();
  const boxTypes = await prisma.boxType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { boxes: true } } },
  });

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Einstellungen</h1>

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Kistenarten</h2>
          <p className="text-sm text-slate-500">
            Lege verschiedene Arten von Kisten an (z.B. Umzugskarton, Werkzeugkiste).
            Beim Anlegen einer Kiste wählst du dann eine Art aus.
          </p>
        </div>

        <BoxTypeForm />

        {boxTypes.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Kistenarten angelegt.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {boxTypes.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <span className="font-medium">{t.name}</span>
                  {t.dimensions && <span className="ml-2 text-sm text-slate-500">{t.dimensions}</span>}
                  <span className="ml-2 text-xs text-slate-400">
                    {t._count.boxes} {t._count.boxes === 1 ? "Kiste" : "Kisten"}
                  </span>
                </div>
                <DeleteBoxTypeButton id={t.id} name={t.name} inUse={t._count.boxes} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
