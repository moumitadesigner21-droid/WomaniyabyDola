import { NextResponse } from "next/server";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import { changeCustomerPassword } from "@/lib/customers/repository";
import { passwordChangeSchema } from "@/lib/customers/schemas";
import { getCurrentCustomer } from "@/lib/customers/session";

export const runtime = "nodejs";

export const POST = withErrorHandling(async (request: Request) => {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const parsed = await parseJsonBody(request, passwordChangeSchema);
  if (!parsed.ok) return parsed.response;

  const result = await changeCustomerPassword(
    customer.id,
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
});
