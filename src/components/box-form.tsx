"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionResult } from "@/lib/actions";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

export interface BoxTypeOption {
  id: string;
  name: string;
  liters: number | null;
  dimensions: string | null;
}

interface Props {
  action: Action;
  submitLabel: string;
  boxTypes: BoxTypeOption[];
  code?: string;
  initial?: { name: string; typeId: string; location: string; notes: string };
}

const empty = { name: "", typeId: "", location: "", notes: "" };

export function BoxForm({ action, submitLabel, boxTypes, code, initial }: Props) {
  const values = initial ?? empty;
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {code && <input type="hidden" name="code" value={code} />}
      <div>
        <label className="label" htmlFor="name">Name der Kiste</label>
        <input id="name" name="name" className="input" defaultValue={values.name} autoFocus placeholder="z.B. Werkzeug Keller" />
      </div>
      <div>
        <label className="label" htmlFor="typeId">Kistenart</label>
        {boxTypes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Noch keine Kistenarten.{" "}
            <Link href="/settings" className="font-medium text-brand-600">In den Einstellungen anlegen.</Link>
          </p>
        ) : (
          <select id="typeId" name="typeId" className="input" defaultValue={values.typeId}>
            <option value="">— ohne Art —</option>
            {boxTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.dimensions ? ` — ${t.dimensions}` : ""}
              </option>
            ))}

          </select>
        )}
      </div>
      <div>
        <label className="label" htmlFor="location">Standort (optional)</label>
        <input id="location" name="location" className="input" defaultValue={values.location} placeholder="z.B. Keller Regal 2" />
      </div>
      <div>
        <label className="label" htmlFor="notes">Notizen (optional)</label>
        <textarea id="notes" name="notes" className="input min-h-20" defaultValue={values.notes} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Speichern…" : submitLabel}
      </button>
    </form>
  );
}
