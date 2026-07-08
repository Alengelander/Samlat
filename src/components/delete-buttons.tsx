"use client";

import { deleteItemAction, deleteBoxAction, deleteBoxTypeAction } from "@/lib/actions";

export function DeleteItemButton({ id, code }: { id: string; code: string }) {
  return (
    <form
      action={deleteItemAction}
      onSubmit={(e) => {
        if (!confirm("Gegenstand wirklich entfernen?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="code" value={code} />
      <button type="submit" className="text-slate-400 hover:text-red-600" title="Entfernen">✕</button>
    </form>
  );
}

export function DeleteBoxButton({ code }: { code: string }) {
  return (
    <form
      action={deleteBoxAction}
      onSubmit={(e) => {
        if (!confirm("Diese Kiste inkl. Inhalt wirklich löschen?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="code" value={code} />
      <button type="submit" className="btn-danger w-full">Kiste löschen</button>
    </form>
  );
}

export function DeleteBoxTypeButton({ id, name, inUse }: { id: string; name: string; inUse: number }) {
  return (
    <form
      action={deleteBoxTypeAction}
      onSubmit={(e) => {
        const msg =
          inUse > 0
            ? `„${name}" löschen? ${inUse} Kiste(n) verlieren dadurch ihre Art (bleiben aber erhalten).`
            : `„${name}" löschen?`;
        if (!confirm(msg)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-slate-400 hover:text-red-600" title="Löschen">✕</button>
    </form>
  );
}
