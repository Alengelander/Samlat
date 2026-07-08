import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddItemForm } from "@/components/add-item-form";
import { DeleteItemButton, DeleteBoxButton } from "@/components/delete-buttons";

export const dynamic = "force-dynamic";

export default async function BoxPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await requireSession();
  const { code } = await params;

  const box = await prisma.box.findUnique({
    where: { code },
    include: { type: true, items: { orderBy: { createdAt: "asc" } } },
  });
  if (!box) notFound();

  const appUrl = process.env.APP_URL ?? "";
  const boxUrl = `${appUrl}/b/${box.code}`;
  const qrDataUrl = await QRCode.toDataURL(boxUrl, { margin: 1, width: 240 });

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Alle Kisten</Link>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{box.name}</h1>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">{box.code}</span>
            </div>
            <dl className="mt-2 space-y-1 text-sm text-slate-600">
              {box.type && (
                <div>
                  <span className="text-slate-400">Art:</span> {box.type.name}
                  {box.type.dimensions ? ` — ${box.type.dimensions}` : ""}
                </div>
              )}
              {box.location && <div><span className="text-slate-400">Standort:</span> {box.location}</div>}
              {box.notes && <div><span className="text-slate-400">Notizen:</span> {box.notes}</div>}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/b/${box.code}/edit`} className="btn-secondary">Bearbeiten</Link>
              <a href={`/api/boxes/${box.code}/label`} target="_blank" className="btn-secondary">Etikett drucken (PDF)</a>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR-Code für ${box.name}`} className="h-32 w-32 rounded border border-slate-200" />
            <span className="mt-1 font-mono text-xs text-slate-400">{box.code}</span>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">Inhalt ({box.items.length})</h2>
        <AddItemForm code={box.code} />
        {box.items.length === 0 ? (
          <p className="text-sm text-slate-500">Noch kein Inhalt erfasst.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {box.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.quantity > 1 && <span className="ml-2 text-sm text-slate-500">× {item.quantity}</span>}
                  {item.notes && <span className="ml-2 text-sm text-slate-400">— {item.notes}</span>}
                </div>
                <DeleteItemButton id={item.id} code={box.code} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <DeleteBoxButton code={box.code} />
      </div>
    </div>
  );
}
