import { NextResponse } from "next/server";
import { z } from "zod";
import {
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session";
import { authenticateAdmin, DEFAULT_ADMIN_USERNAME } from "@/lib/admin/users";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60).default(DEFAULT_ADMIN_USERNAME),
  password: z.string().min(1, "Password is required.").max(200),
});

export const POST = withErrorHandling(async (request: Request) => {
  const limiter = await rateLimit("LOGIN_LIMITER", getClientIp(request));
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSeconds) },
      },
    );
  }

  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;

  const user = await authenticateAdmin(parsed.data.username, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await createAdminSessionToken(user);
  const response = NextResponse.json({ success: true, username: user.username });
  response.cookies.set(COOKIE_NAME, token, getAdminSessionCookieOptions());
  return response;
});
