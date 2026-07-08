import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "samlat_session";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 Tage

export interface SessionPayload {
  userId: string;
  username: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET ist nicht gesetzt.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId === "string" && typeof payload.username === "string") {
      return { userId: payload.userId, username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
