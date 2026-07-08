"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="input"
        placeholder="Suche nach Kiste, Inhalt oder Ort…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="search"
      />
      <button type="submit" className="btn-secondary shrink-0">Suchen</button>
    </form>
  );
}
