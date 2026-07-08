"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateUniqueBoxCode } from "@/lib/code";
import { createSessionToken } from "@/lib/session";
import {
  requireSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { BOX_SIZE_KEYS } from "@/lib/box-sizes";

export interface ActionResult {
  error?: string;
  ok?: boolean;
}

// --- Auth ---

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/") || "/";

  if (!username || !password) {
    return { error: "Bitte Benutzername und Passwort eingeben." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !ok) {
    return { error: "Benutzername oder Passwort ist falsch." };
  }

  const token = await createSessionToken({ userId: user.id, username: user.username });
  await setSessionCookie(token);
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

// --- Kisten ---

const boxSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich.").max(120),
  size: z.enum(BOX_SIZE_KEYS as [string, ...string[]]),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function createBoxAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = boxSchema.safeParse({
    name: formData.get("name"),
    size: formData.get("size"),
    location: formData.get("location"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const code = await generateUniqueBoxCode();
  await prisma.box.create({
    data: {
      code,
      name: parsed.data.name,
      size: parsed.data.size,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/");
  redirect(`/b/${code}`);
}

export async function updateBoxAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const code = String(formData.get("code") ?? "");
  if (!code) return { error: "Kiste nicht gefunden." };

  const parsed = boxSchema.safeParse({
    name: formData.get("name"),
    size: formData.get("size"),
    location: formData.get("location"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await prisma.box.update({
    where: { code },
    data: {
      name: parsed.data.name,
      size: parsed.data.size,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath(`/b/${code}`);
  revalidatePath("/");
  redirect(`/b/${code}`);
}

export async function deleteBoxAction(formData: FormData): Promise<void> {
  await requireSession();
  const code = String(formData.get("code") ?? "");
  if (code) {
    await prisma.box.delete({ where: { code } }).catch(() => {});
    revalidatePath("/");
  }
  redirect("/");
}

// --- Inhalt (Items) ---

const itemSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich.").max(120),
  quantity: z.coerce.number().int().min(1).max(100000).default(1),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function addItemAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const code = String(formData.get("code") ?? "");
  const box = code ? await prisma.box.findUnique({ where: { code } }) : null;
  if (!box) return { error: "Kiste nicht gefunden." };

  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity") || 1,
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  await prisma.item.create({
    data: {
      boxId: box.id,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath(`/b/${code}`);
  return { ok: true };
}

export async function deleteItemAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const code = String(formData.get("code") ?? "");
  if (id) {
    await prisma.item.delete({ where: { id } }).catch(() => {});
    if (code) revalidatePath(`/b/${code}`);
  }
}
