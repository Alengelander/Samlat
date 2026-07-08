"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBoxTypeAction, type ActionResult } from "@/lib/actions";

export function BoxTypeForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(createBoxTypeAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="min-w-40 flex-1">
        <label className="label" htmlFor="type-name">Name</label>
        <input id="type-name" name="name" className="input" placeholder="z.B. Umzugskarton" />
      </div>
      <div className="min-w-40 flex-1">
        <label className="label" htmlFor="type-dim">Maße (optional)</label>
        <input id="type-dim" name="dimensions" className="input" placeholder="z.B. 40 x 30 x 25 cm" />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "…" : "Hinzufügen"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
