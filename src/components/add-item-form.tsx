"use client";

import { useActionState, useEffect, useRef } from "react";
import { addItemAction, type ActionResult } from "@/lib/actions";

export function AddItemForm({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(addItemAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="code" value={code} />
      <div className="min-w-40 flex-1">
        <label className="label" htmlFor="item-name">Gegenstand</label>
        <input id="item-name" name="name" className="input" placeholder="z.B. Akkuschrauber" />
      </div>
      <div className="w-20">
        <label className="label" htmlFor="item-qty">Anzahl</label>
        <input id="item-qty" name="quantity" type="number" min={1} defaultValue={1} className="input" />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "…" : "Hinzufügen"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
