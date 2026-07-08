import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="text-3xl font-semibold">Nicht gefunden</h1>
      <p className="mt-2 text-slate-500">Diese Kiste oder Seite existiert nicht.</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">Zur Übersicht</Link>
    </div>
  );
}
