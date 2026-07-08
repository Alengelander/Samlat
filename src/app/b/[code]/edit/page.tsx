import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBoxAction } from "@/lib/actions";
import { BoxForm } from "@/components/box-form";

export default async function EditBoxPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await requireSession();
  const { code } = await params;
  const box = await prisma.box.findUnique({ where: { code } });
  if (!box) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href={`/b/${box.code}`} className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">Kiste bearbeiten</h1>
      <div className="card">
        <BoxForm
          action={updateBoxAction}
          submitLabel="Änderungen speichern"
          code={box.code}
          initial={{
            name: box.name,
            size: box.size,
            location: box.location ?? "",
            notes: box.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
