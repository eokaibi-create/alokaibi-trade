import { compareSync, hashSync } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "okaibi-jwt-secret-2024";

export function hashPassword(pw: string) {
  return hashSync(pw, 10);
}

export function comparePassword(pw: string, hash: string) {
  return compareSync(pw, hash);
}

export function createToken(username: string) {
  return sign({ username }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as { username: string };
  } catch {
    return null;
  }
}

export async function getAdminToken() {
  const store = await cookies();
  return store.get("admin_token")?.value || null;
}

export function setAdminCookie(token: string) {
  return {
    name: "admin_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
  };
}

export function clearAdminCookie() {
  return {
    name: "admin_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
