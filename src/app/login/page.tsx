import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { next } = await searchParams;

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="card">
        <h1 className="mb-1 text-xl font-semibold">Anmelden</h1>
        <p className="mb-4 text-sm text-slate-500">Bitte melde dich an, um deine Kisten zu verwalten.</p>
        <Suspense>
          <LoginForm next={next ?? "/"} />
        </Suspense>
      </div>
    </div>
  );
}
