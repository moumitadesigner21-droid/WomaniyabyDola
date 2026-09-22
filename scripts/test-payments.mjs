import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import Database from "better-sqlite3";
import { createHmac } from "node:crypto";
import { z } from "zod";

function load(file, imports, extra = {}) {
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: (id) => { if (!(id in imports)) throw Error(id); return imports[id]; }, crypto, TextEncoder, atob, btoa, Date, console, ...extra });
  return exports;
}

function fixture() {
  const sql = new Database(":memory:");
  for (const file of readdirSync("migrations").sort()) sql.exec(readFileSync(`migrations/${file}`, "utf8"));
  sql.exec(`INSERT INTO orders(id,order_number,customer_name,customer_phone,subtotal,total,payment_status,idempotency_key,created_at) VALUES('id','WD-test','Test','9999999999',100,100,'pending','idem','2026-01-01');
    INSERT INTO products(id,slug,name,category_slug,price,image,stock_quantity,created_at,updated_at) VALUES('p','p','Product','test',100,'/p.jpg',9,'now','now');
    INSERT INTO order_items(order_id,product_id,name,quantity,price) VALUES('id','p','Product',1,100);`);
  const db = {
    queryOne: async (q,...p) => sql.prepare(q).get(...p), queryAll: async (q,...p) => sql.prepare(q).all(...p),
    execute: async (q,...p) => sql.prepare(q).run(...p), stmt: (q,...p) => {
      if (!/\?\d/.test(q)) return {q,p};
      const ordered = [];
      return {q:q.replace(/\?(\d+)/g, (_,n) => { ordered.push(p[Number(n)-1]); return "?"; }),p:ordered};
    },
    batch: async (statements) => sql.transaction(() => statements.map(({q,p}) => ({meta:sql.prepare(q).run(...p)})))(),
    nowIso: () => new Date().toISOString(), uuid: () => crypto.randomUUID(),
  };
  const repo = load("src/lib/orders/repository.ts", {"react":{cache:f=>f},"@/lib/db":db,"@/lib/cms/content-repository":{}});
  let remote = {order_id:"WD-test", order_amount:100,order_currency:"INR",order_status:"ACTIVE"};
  let payments = [];
  const finalize = load("src/lib/payments/finalize.ts", {
    "@/lib/db":db,"@/lib/orders/repository":repo,
    "@/lib/orders/paid-notifications":{notifyPaidOrder:()=>repo.getOrderById("id")},
    "./cashfree":{CashfreeApiError:class extends Error {},getCashfreeOrder:async()=>remote,getCashfreePayments:async()=>payments},
  });
  return {sql,db,repo,finalize,setRemote:r=>remote={...remote,...r},setPayments:p=>payments=p};
}

test("failed attempt remains reserved; retry succeeds; late failure cannot downgrade", async () => {
  const f=fixture();
  f.setPayments([{cf_payment_id:1,payment_status:"FAILED",payment_amount:100,payment_currency:"INR"}]);
  assert.equal((await f.finalize.reconcileCashfreePayment("WD-test")).paymentStatus,"pending");
  assert.equal(f.sql.prepare("SELECT stock_quantity FROM products").get().stock_quantity,9);
  f.setPayments([{cf_payment_id:1,payment_status:"FAILED"},{cf_payment_id:2,payment_status:"SUCCESS",payment_amount:100,payment_currency:"INR"}]);
  assert.equal((await f.finalize.reconcileCashfreePayment("WD-test")).paymentStatus,"paid");
  await f.repo.updateCashfreePayment("id",{paymentStatus:"failed"});
  await f.repo.releaseOrderInventory("id");
  assert.equal((await f.repo.getOrderById("id")).paymentStatus,"paid");
  assert.equal(f.sql.prepare("SELECT stock_quantity FROM products").get().stock_quantity,9);
});
test("duplicate expiry reconciliations restore stock once",async()=>{
  const f=fixture();f.setRemote({order_status:"EXPIRED"});
  await Promise.all([f.finalize.reconcileCashfreePayment("WD-test"),f.finalize.reconcileCashfreePayment("WD-test")]);
  assert.equal(f.sql.prepare("SELECT stock_quantity FROM products").get().stock_quantity,10);
  assert.equal((await f.repo.getOrderById("id")).inventoryReleased,true);
});
test("provider amount and currency mismatch cannot mark an order paid",async()=>{
  for(const mismatch of [{payment_amount:1,payment_currency:"INR"},{payment_amount:100,payment_currency:"USD"}]){
    const f=fixture();f.setPayments([{cf_payment_id:1,payment_status:"SUCCESS",...mismatch}]);
    await assert.rejects(f.finalize.reconcileCashfreePayment("WD-test"),/mismatch/);
    assert.equal((await f.repo.getOrderById("id")).paymentStatus,"pending");
  }
});
test("raw-body webhook signature rejects mutation and malformed signature",async()=>{
  const api=load("src/lib/payments/cashfree.ts",{"./config":{paymentEnv:()=>"test-secret",cashfreeEnvironment:()=>"sandbox"}});
  const raw='{"amount":100.00}',timestamp="123";
  const signature=createHmac("sha256","test-secret").update(timestamp+raw).digest("base64");
  assert.equal(await api.verifyCashfreeWebhook(raw,timestamp,signature),true);
  assert.equal(await api.verifyCashfreeWebhook('{"amount":100}',timestamp,signature),false);
  assert.equal(await api.verifyCashfreeWebhook(raw,timestamp,"not-base64!"),false);
});

test("stock reservation is all-or-nothing and duplicate creation reserves once", async () => {
  const f = fixture();
  const item = {productId:"p",slug:"p",name:"Product",size:null,variantId:null,variantLabel:null,quantity:1,price:100};
  const input = {customerName:"Test",customerPhone:"9999999999",paymentStatus:"pending",items:[item,{...item,quantity:99}],subtotal:10000,shipping:0,discount:0,total:10000,couponCode:null,idempotencyKey:"new-checkout"};
  await assert.rejects(f.repo.createOrder(input), /stock/i);
  assert.equal(f.sql.prepare("SELECT stock_quantity FROM products").get().stock_quantity,9);
  assert.equal(f.sql.prepare("SELECT COUNT(*) AS n FROM orders").get().n,1);
  input.items = [item]; input.subtotal = input.total = 100;
  const a = await f.repo.createOrder(input), b = await f.repo.createOrder(input);
  assert.equal(a.order.id,b.order.id);
  assert.equal(b.duplicate,true);
  assert.equal(f.sql.prepare("SELECT stock_quantity FROM products").get().stock_quantity,8);
});

test("failing oldest reconciliation batch yields to later orders", async () => {
  const f=fixture();
  f.sql.prepare("UPDATE orders SET inventory_reserved_until = '2020-01-01'").run();
  for(let i=0;i<11;i++) f.sql.prepare(`INSERT INTO orders(id,order_number,customer_name,customer_phone,subtotal,total,payment_status,idempotency_key,created_at,inventory_reserved_until) VALUES(?,?,'Test','9999999999',100,100,'pending',?,'2020','2020-01-01')`).run(`o${i}`,`number${i}`,`key${i}`);
  f.setRemote({order_amount:99}); // Every provider response is deliberately inconsistent.
  assert.equal((await f.finalize.reconcileExpiredPayments()).checked,10);
  assert.equal((await f.finalize.reconcileExpiredPayments()).checked,2);
  assert.equal((await f.finalize.reconcileExpiredPayments()).checked,0);
});

test("notification failures retry, successful channels do not resend, crashed leases recover", async () => {
  const f=fixture(); f.sql.exec("UPDATE orders SET payment_status='paid'");
  let success=false,calls=0;
  const send=async()=>{calls++;return {success,error:success?null:'temporary'}};
  const notifications=load('src/lib/orders/paid-notifications.ts',{
    '@/lib/db':f.db,'@/lib/orders/repository':{...f.repo,getSettings:async()=>({})},
    '@/lib/payments/config':{cashfreeEnvironment:()=> 'production'},
    '@/lib/orders/email':{sendOwnerEmailNotification:send},
    '@/lib/orders/whatsapp':{sendCustomerWhatsAppNotification:send,sendOwnerWhatsAppNotification:send}
  });
  await notifications.retryPaidNotifications(); assert.equal(calls,3);
  await notifications.retryPaidNotifications(); assert.equal(calls,3);
  f.sql.exec("UPDATE payment_notification_jobs SET state='sending',next_at='2020-01-01'");
  success=true;
  await notifications.retryPaidNotifications(); assert.equal(calls,6);
  await notifications.retryPaidNotifications(); assert.equal(calls,6);
  assert.equal(f.sql.prepare("SELECT COUNT(*) AS n FROM payment_notification_jobs WHERE state='sent'").get().n,3);
});

test("checkout recovery returns only a reference and changed coupon/email/notes/size cannot reuse old session", async () => {
  const f=fixture();
  f.sql.exec("UPDATE orders SET idempotency_key='recovery-key',customer_address='Test address',cashfree_order_id='WD-test',cashfree_payment_session_id='session'");
  let body;
  const route=load('src/app/api/payments/cashfree/order/route.ts',{
    'next/server':{NextResponse:{json:(b,o)=>Response.json(b,o)}},zod:{z},
    '@/lib/api/rate-limit':{getClientIp:()=> 'test',rateLimit:async()=>({allowed:true})},
    '@/lib/api/validation':{parseJsonBody:async()=>({ok:true,data:body})},
    '@/lib/customers/session':{getCurrentCustomer:async()=>null},
    '@/lib/site-url':{getSiteUrl:()=>new URL('https://example.com')},
    '@/lib/orders/schemas':{orderItemSchema:z.any()},
    '@/lib/orders/repository':{...f.repo,getShippingPaymentConfig:async()=>({paymentsEnabled:true})},
    '@/lib/payments/config':{cashfreeEnvironment:()=> 'sandbox'},
    '@/lib/payments/public-order':{publicPaymentOrder:o=>({orderNumber:o.orderNumber})},
    '@/lib/orders/pricing':{PricingError:class extends Error{},quoteOrder:()=>{throw Error('must not reprice existing')}} ,
    '@/lib/payments/cashfree':{isCashfreeConfigured:()=>true,createCashfreeOrder:()=>{throw Error('must not create')}}
  },{URL});
  const recovery=await (await route.GET(new Request('https://example.com/api?key=recovery-key'))).json();
  assert.deepEqual(Object.keys(recovery),['returnUrl']); assert.match(recovery.returnUrl,/WD-test/);
  const original={idempotencyKey:'recovery-key',customerName:'Test',customerPhone:'9999999999',customerAddress:'Test address',items:[{productId:'p',quantity:1}]};
  for(const change of [{couponCode:'NEW'},{customerEmail:'new@example.com'},{notes:'new'}, {items:[{productId:'p',quantity:1,size:'XL'}]}]){
    body={...original,...change}; const response=await route.POST(new Request('https://example.com',{method:'POST'}));
    assert.equal(response.status,409); const data=await response.json();assert.ok(data.returnUrl);assert.equal(data.restart,undefined);
  }
});
