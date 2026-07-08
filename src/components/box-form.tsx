"use client";

import { useActionState } from "react";
import { BOX_SIZES } from "@/lib/box-sizes";
import type { ActionResult } from "@/lib/actions";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

interface Props {
  action: Action;
  submitLabel: string;
  code?: string;
  initial?: { name: string; size: string; location: string; notes: string };
}

const empty = { name: "", size: "M", location: "", notes: "" };

export function BoxForm({ action, submitLabel, code, initial }: Props) {
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
        <label className="label" htmlFor="size">Größe</label>
        <select id="size" name="size" className="input" defaultValue={values.size}>
          {BOX_SIZES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} ({s.key}) — {s.dimensions}
            </option>
          ))}
        </select>
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
