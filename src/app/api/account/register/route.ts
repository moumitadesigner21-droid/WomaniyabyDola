import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { createCustomer, getCustomerByEmail } from "@/lib/customers/repository";
import { registerSchema } from "@/lib/customers/schemas";
import { CUSTOMER_COOKIE_NAME, createCustomerSessionToken, getCustomerCookieOptions } from "@/lib/customers/session";

export const runtime = "nodejs";

export const POST = withErrorHandling(async (request: Request) => {
  const limiter = await rateLimit("LOGIN_LIMITER", `register:${getClientIp(request)}`);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = await parseJsonBody(request, registerSchema);
  if (!parsed.ok) return parsed.response;

  if (await getCustomerByEmail(parsed.data.email)) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );
  }

  const customer = await createCustomer({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });

  const response = NextResponse.json({ customer }, { status: 201 });
  response.cookies.set(
    CUSTOMER_COOKIE_NAME,
    await createCustomerSessionToken(customer.id),
    getCustomerCookieOptions(),
  );
  return response;
});
