import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBoxTypeAction } from "@/lib/actions";
import { BoxTypeForm } from "@/components/box-type-form";

export const dynamic = "force-dynamic";

export default async function EditBoxTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const type = await prisma.boxType.findUnique({
    where: { id },
    select: { id: true, name: true, liters: true, dimensions: true, imageType: true },
  });
  if (!type) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Kistenart bearbeiten</h1>

      {type.imageType && (
        <div className="card">
          <p className="label">Aktuelles Bild</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/box-types/${type.id}/image`} alt={type.name} className="img-frame max-h-48 rounded border border-slate-200 object-contain p-2" />
        </div>
      )}

      <div className="card">
        <BoxTypeForm
          action={updateBoxTypeAction}
          submitLabel="Änderungen speichern"
          mode="edit"
          id={type.id}
          hasImage={!!type.imageType}
          initial={{
            name: type.name,
            liters: type.liters != null ? String(type.liters) : "",
            dimensions: type.dimensions ?? "",
          }}
        />
      </div>
    </div>
  );
}
