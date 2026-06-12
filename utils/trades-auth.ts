import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.TRADES_SESSION_SECRET ?? "dev-secret-change-in-prod";
const COOKIE = "tv_trades";

// ── Password hashing (scrypt, no extra deps) ─────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, stored] = hash.split(":");
    const derived = scryptSync(password, salt, 64);
    return timingSafeEqual(derived, Buffer.from(stored, "hex"));
  } catch {
    return false;
  }
}

// ── Session cookie (HMAC-signed, no DB needed) ───────────────────────────────

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export async function setTradesSession(tradeId: string): Promise<void> {
  const jar = await cookies();
  const payload = Buffer.from(
    JSON.stringify({ id: tradeId, exp: Date.now() + 7 * 86_400_000 })
  ).toString("base64url");
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 86_400,
    path: "/trades-portal",
  });
}

export async function getTradesSession(): Promise<{ tradeId: string } | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    const { id, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (Date.now() > exp) return null;
    return { tradeId: id };
  } catch {
    return null;
  }
}

export async function clearTradesSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
