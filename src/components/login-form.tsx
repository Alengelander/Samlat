"use client";

import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";

const initial: ActionResult = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="username">Benutzername</label>
        <input id="username" name="username" className="input" autoComplete="username" autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="password">Passwort</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Anmelden…" : "Anmelden"}
      </button>
    </form>
  );
}
