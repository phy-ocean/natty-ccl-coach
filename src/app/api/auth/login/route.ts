import { NextResponse } from "next/server";

const COOKIE_NAME = "naati_session";
const SALT = "naati-ccl-coach-v1";

async function computeToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + ":" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  const envPassword = process.env.APP_ACCESS_PASSWORD;
  if (!envPassword) {
    return NextResponse.json({ ok: true });
  }

  const { password } = (await req.json()) as { password?: string };
  if (!password || password !== envPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await computeToken(envPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
