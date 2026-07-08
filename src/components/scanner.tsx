"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Extrahiert den Kisten-Code aus einem gescannten QR (URL oder roher Code).
function extractCode(text: string): string | null {
  try {
    const url = new URL(text);
    const match = url.pathname.match(/\/b\/([^/]+)/);
    if (match) return match[1];
  } catch {
    // keine URL — evtl. roher Code
  }
  const trimmed = text.trim();
  return /^[A-Z0-9]{4,12}$/i.test(trimmed) ? trimmed : null;
}

export function Scanner() {
  const router = useRouter();
  const containerId = "qr-reader";
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            const code = extractCode(decoded);
            if (code) {
              scanner.stop().catch(() => {});
              router.push(`/b/${code}`);
            }
          },
          () => {},
        );
        if (!cancelled) setActive(true);
      } catch {
        if (!cancelled) setError("Kamera konnte nicht gestartet werden. Zugriff erlaubt?");
      }
    }

    start();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) s.stop().then(() => s.clear()).catch(() => {});
    };
  }, [router]);

  return (
    <div className="space-y-3">
      <div id={containerId} className="overflow-hidden rounded-xl border border-slate-200 bg-black" />
      {!active && !error && <p className="text-sm text-slate-500">Kamera wird gestartet…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
