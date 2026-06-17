import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "meranti_admin_session";
const SESSION_DURATION = 60 * 60 * 24; // 24 jam

export interface AdminSession {
  username: string;
  role: "admin";
}

function getSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-in-production-32chars!";
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(username: string): Promise<void> {
  const token = await new SignJWT({ username, role: "admin" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin" || typeof payload.username !== "string") {
      return null;
    }
    return { username: payload.username, role: "admin" };
  } catch {
    return null;
  }
}
