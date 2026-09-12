import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured on the server." },
        { status: 503 },
      );
    }

    if (body.password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const cookieOptions = getAdminSessionCookieOptions();
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, cookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
