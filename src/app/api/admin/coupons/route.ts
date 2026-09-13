import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { parseJsonBody, withErrorHandling } from "@/lib/api/validation";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from "@/lib/cms/coupons-repository";
import { couponInputSchema, couponPatchSchema } from "@/lib/cms/schemas";

export const runtime = "nodejs";

export const GET = withErrorHandling(async () => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ coupons: await listCoupons() });
});

export const POST = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, couponInputSchema);
  if (!parsed.ok) return parsed.response;

  const coupon = await createCoupon({
    ...parsed.data,
    validFrom: parsed.data.validFrom ?? null,
    validUntil: parsed.data.validUntil ?? null,
    categorySlug: parsed.data.categorySlug ?? null,
    productId: parsed.data.productId ?? null,
  });
  return NextResponse.json({ coupon }, { status: 201 });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, couponPatchSchema);
  if (!parsed.ok) return parsed.response;

  const { id, ...input } = parsed.data;
  const coupon = await updateCoupon(id, input);

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ coupon });
});

export const DELETE = withErrorHandling(async (request: Request) => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteCoupon(id);
  return NextResponse.json({ success: true });
});
