import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "naati_session";
const SALT = "naati-ccl-coach-v1";

const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth/",
  "/api/health",
  "/_next/",
  "/sounds/",
  "/audio/",
  "/favicon.ico",
];

async function computeToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + ":" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const password = process.env.APP_ACCESS_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await computeToken(password);

  if (sessionCookie === expected) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
