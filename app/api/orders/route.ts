// app/api/orders/route.ts
// GET  -> logged-in customer: their own orders. Admin: all orders (?all=true)
// POST -> create an order from the current cart (checkout)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CheckoutItem = { product_id: string; size?: string; quantity?: number };

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const wantsAll = searchParams.get("all") === "true";

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  if (wantsAll) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // RLS already scopes non-admins to their own rows; admin sees all by policy.
  } else {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    items: CheckoutItem[];
    contact_email: string;
    shipping_address: Record<string, string>;
    shipping_paise?: number;
  };

  if (!body.items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 422 });

  // Price everything server-side from the DB — never trust client-sent prices.
  const productIds = body.items.map((i) => i.product_id);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price_paise, stock, status")
    .in("id", productIds);

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 });

  const byId = new Map(products!.map((p) => [p.id, p]));
  let subtotal = 0;
  const lineItems = body.items.map((item) => {
    const p = byId.get(item.product_id);
    if (!p) throw new Error(`Product ${item.product_id} not found`);
    if (p.status !== "live" || p.stock < (item.quantity ?? 1)) {
      throw new Error(`"${p.name}" is no longer available in that quantity`);
    }
    const qty = item.quantity ?? 1;
    subtotal += p.price_paise * qty;
    return {
      product_id: p.id,
      product_name_snapshot: p.name,
      price_paise_snapshot: p.price_paise,
      size: item.size ?? null,
      quantity: qty,
    };
  });

  const shipping = body.shipping_paise ?? 0;
  const total = subtotal + shipping;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      contact_email: body.contact_email,
      shipping_address: body.shipping_address,
      subtotal_paise: subtotal,
      shipping_paise: shipping,
      total_paise: total,
      status: "pending",
    })
    .select()
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 400 });

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 400 });

  // Decrement stock; mark one-of-ones / zero-stock as sold.
  for (const li of lineItems) {
    const p = byId.get(li.product_id)!;
    const newStock = p.stock - li.quantity;
    await supabase
      .from("products")
      .update({ stock: newStock, is_sold: newStock <= 0, status: newStock <= 0 ? "sold" : "live" })
      .eq("id", li.product_id);
  }

  // NOTE: wire your payment provider (Stripe, Razorpay, etc.) here —
  // create a PaymentIntent/order with `total`, then flip order.status
  // to "paid" from that provider's webhook, not from the client.

  return NextResponse.json({ order }, { status: 201 });
}
