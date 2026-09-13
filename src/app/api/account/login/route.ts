import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { authenticateCustomer } from "@/lib/customers/repository";
import { loginSchema } from "@/lib/customers/schemas";
import { CUSTOMER_COOKIE_NAME, createCustomerSessionToken, getCustomerCookieOptions } from "@/lib/customers/session";

export const runtime = "nodejs";

export const POST = withErrorHandling(async (request: Request) => {
  const limiter = await rateLimit("LOGIN_LIMITER", `customer:${getClientIp(request)}`);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.ok) return parsed.response;

  const customer = await authenticateCustomer(parsed.data.email, parsed.data.password);
  if (!customer) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ customer });
  response.cookies.set(
    CUSTOMER_COOKIE_NAME,
    await createCustomerSessionToken(customer.id),
    getCustomerCookieOptions(),
  );
  return response;
});
