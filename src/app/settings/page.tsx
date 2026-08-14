import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBoxTypeAction } from "@/lib/actions";
import { BoxTypeForm } from "@/components/box-type-form";
import { DeleteBoxTypeButton } from "@/components/delete-buttons";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSession();
  const boxTypes = await prisma.boxType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      liters: true,
      dimensions: true,
      imageType: true,
      _count: { select: { boxes: true } },
    },
  });

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Einstellungen</h1>

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Kistenarten</h2>
          <p className="text-sm text-slate-500">
            Verschiedene Arten von Kisten (z.B. IKEA SAMLA), unterschieden nach Größe in Litern.
            Beim Anlegen einer Kiste wählst du eine Art; die Kisten-Nummer beginnt mit der Litergröße.
          </p>
        </div>

        {boxTypes.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Kistenarten angelegt.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {boxTypes.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <div className="img-frame grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded border border-slate-200">
                  {t.imageType ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/box-types/${t.id}/image`} alt={t.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-lg text-slate-300">📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{t.name}</span>
                    {t.liters != null && <span className="text-sm text-brand-600">{t.liters} l</span>}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.dimensions && <span>{t.dimensions} · </span>}
                    {t._count.boxes} {t._count.boxes === 1 ? "Kiste" : "Kisten"}
                  </div>
                </div>
                <Link href={`/settings/box-types/${t.id}/edit`} className="text-sm text-brand-600 hover:underline">Bearbeiten</Link>
                <DeleteBoxTypeButton id={t.id} name={t.name} inUse={t._count.boxes} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Neue Kistenart</h2>
        <BoxTypeForm action={createBoxTypeAction} submitLabel="Hinzufügen" mode="create" />
      </section>
    </div>
  );
}
