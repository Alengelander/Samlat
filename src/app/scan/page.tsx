import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { Scanner } from "@/components/scanner";

export default async function ScanPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Zurück</Link>
      <h1 className="text-2xl font-semibold">QR-Code scannen</h1>
      <p className="text-sm text-slate-500">
        Halte den QR-Code einer Kiste vor die Kamera, um direkt zu ihrem Inhalt zu gelangen.
      </p>
      <Scanner />
    </div>
  );
}
