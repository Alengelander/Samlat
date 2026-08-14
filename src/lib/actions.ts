"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateBoxNumber } from "@/lib/code";
import { createSessionToken } from "@/lib/session";
import {
  requireSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { Prisma } from "@prisma/client";

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
  typeId: z.string().trim().optional().or(z.literal("")),
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
    typeId: formData.get("typeId"),
    location: formData.get("location"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const type = parsed.data.typeId
    ? await prisma.boxType.findUnique({ where: { id: parsed.data.typeId } })
    : null;
  const code = await generateBoxNumber(type?.liters ?? null);
  await prisma.box.create({
    data: {
      code,
      name: parsed.data.name,
      typeId: type?.id ?? null,
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
    typeId: formData.get("typeId"),
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
      typeId: parsed.data.typeId || null,
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

// --- Kistenarten (Einstellungen) ---

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const boxTypeSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich.").max(80),
  liters: z.coerce.number().int().min(0).max(100000).optional(),
  dimensions: z.string().trim().max(80).optional().or(z.literal("")),
});

// Liest ein optionales Bild aus dem Formular. Gibt undefined zurueck, wenn
// keine Datei gewaehlt wurde (Bild bleibt dann unveraendert).
async function readImage(
  formData: FormData,
): Promise<{ image: Uint8Array<ArrayBuffer>; imageType: string } | undefined | { error: string }> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) return { error: "Bitte eine Bilddatei hochladen." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Bild ist zu groß (max. 8 MB)." };
  const image = new Uint8Array(await file.arrayBuffer());
  return { image, imageType: file.type };
}

export async function createBoxTypeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();

  const parsed = boxTypeSchema.safeParse({
    name: formData.get("name"),
    liters: formData.get("liters") || undefined,
    dimensions: formData.get("dimensions"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const img = await readImage(formData);
  if (img && "error" in img) return { error: img.error };

  const max = await prisma.boxType.aggregate({ _max: { sortOrder: true } });
  try {
    await prisma.boxType.create({
      data: {
        name: parsed.data.name,
        liters: parsed.data.liters ?? null,
        dimensions: parsed.data.dimensions || null,
        image: img?.image ?? null,
        imageType: img?.imageType ?? null,
        sortOrder: parsed.data.liters ?? (max._max.sortOrder ?? 0) + 1,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Eine Kistenart mit diesem Namen existiert bereits." };
    }
    throw e;
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function updateBoxTypeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Kistenart nicht gefunden." };

  const parsed = boxTypeSchema.safeParse({
    name: formData.get("name"),
    liters: formData.get("liters") || undefined,
    dimensions: formData.get("dimensions"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const img = await readImage(formData);
  if (img && "error" in img) return { error: img.error };

  try {
    await prisma.boxType.update({
      where: { id },
      data: {
        name: parsed.data.name,
        liters: parsed.data.liters ?? null,
        dimensions: parsed.data.dimensions || null,
        sortOrder: parsed.data.liters ?? undefined,
        // Bild nur ersetzen, wenn ein neues hochgeladen wurde.
        ...(img ? { image: img.image, imageType: img.imageType } : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Eine Kistenart mit diesem Namen existiert bereits." };
    }
    throw e;
  }

  revalidatePath("/settings");
  revalidatePath(`/settings/box-types/${id}/edit`);
  redirect("/settings");
}

export async function deleteBoxTypeAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Kisten behalten dank onDelete: SetNull ihre Daten, verlieren nur die Art.
    await prisma.boxType.delete({ where: { id } }).catch(() => {});
    revalidatePath("/settings");
    revalidatePath("/");
  }
}
