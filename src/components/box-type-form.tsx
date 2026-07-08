"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionResult } from "@/lib/actions";

type Action = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

interface Props {
  action: Action;
  submitLabel: string;
  mode: "create" | "edit";
  id?: string;
  initial?: { name: string; liters: string; dimensions: string };
  hasImage?: boolean;
}

const empty = { name: "", liters: "", dimensions: "" };

export function BoxTypeForm({ action, submitLabel, mode, id, initial, hasImage }: Props) {
  const values = initial ?? empty;
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && mode === "create") {
      formRef.current?.reset();
      formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
  }, [state, mode]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {id && <input type="hidden" name="id" value={id} />}
      <div className="flex flex-wrap gap-3">
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="bt-name">Name</label>
          <input id="bt-name" name="name" className="input" defaultValue={values.name} placeholder="z.B. SAMLA 45 l" />
        </div>
        <div className="w-28">
          <label className="label" htmlFor="bt-liters">Liter</label>
          <input id="bt-liters" name="liters" type="number" min={0} className="input" defaultValue={values.liters} placeholder="45" />
        </div>
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="bt-dim">Maße</label>
          <input id="bt-dim" name="dimensions" className="input" defaultValue={values.dimensions} placeholder="57 x 39 x 28 cm" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bt-image">
          Bild {hasImage && <span className="text-slate-400">(vorhanden — leer lassen zum Behalten)</span>}
        </label>
        <input id="bt-image" name="image" type="file" accept="image/*" className="input" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Speichern…" : submitLabel}
      </button>
    </form>
  );
}
