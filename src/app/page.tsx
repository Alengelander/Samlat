import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoxSize } from "@/lib/box-sizes";
import { SearchBar } from "@/components/search-bar";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const boxes = await prisma.box.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { items: { some: { name: { contains: query, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { items: true } },
      items: query
        ? { where: { name: { contains: query, mode: "insensitive" } }, take: 3 }
        : false,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meine Kisten</h1>
        <span className="text-sm text-slate-500">{boxes.length} {boxes.length === 1 ? "Kiste" : "Kisten"}</span>
      </div>

      <SearchBar defaultValue={query} />

      {boxes.length === 0 ? (
        <div className="card text-center text-slate-500">
          {query ? (
            <p>Nichts gefunden für „{query}".</p>
          ) : (
            <p>
              Noch keine Kisten.{" "}
              <Link href="/boxes/new" className="font-medium text-brand-600">Lege deine erste an.</Link>
            </p>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {boxes.map((box) => {
            const size = getBoxSize(box.size);
            const matchedItems = "items" in box && Array.isArray(box.items) ? box.items : [];
            return (
              <li key={box.id}>
                <Link href={`/b/${box.code}`} className="card block transition hover:border-brand-300 hover:shadow">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{box.name}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">{box.code}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                    <span>{size.label} ({size.key})</span>
                    {box.location && <span>📍 {box.location}</span>}
                    <span>{box._count.items} {box._count.items === 1 ? "Gegenstand" : "Gegenstände"}</span>
                  </div>
                  {matchedItems.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {matchedItems.map((it) => (
                        <span key={it.id} className="rounded bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{it.name}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
