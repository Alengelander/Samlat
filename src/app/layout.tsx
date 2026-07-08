import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: "Samlat — Kistenverwaltung",
  description: "Kisten und ihren Inhalt erfassen, per QR-Code wiederfinden.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f6fed",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="de">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-brand-600">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">📦</span>
              Samlat
            </Link>
            {session && (
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/scan" className="btn-secondary !px-3 !py-1.5">Scannen</Link>
                <Link href="/boxes/new" className="btn-primary !px-3 !py-1.5">Neue Kiste</Link>
                <form action={logoutAction}>
                  <button type="submit" className="btn-secondary !px-3 !py-1.5" title="Abmelden">⏻</button>
                </form>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
