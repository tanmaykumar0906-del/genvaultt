// app/api/wishlist/route.ts
// GET    -> logged-in customer: their wishlist (with product details)
// POST   -> add a product_id to wishlist
// DELETE -> remove a product_id (pass ?product_id=... )
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id, created_at, product:products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ wishlist: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id } = await req.json();
  if (!product_id) return NextResponse.json({ error: "product_id is required" }, { status: 422 });

  const { error } = await supabase.from("wishlist_items").upsert({ user_id: user.id, product_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  if (!productId) return NextResponse.json({ error: "product_id is required" }, { status: 422 });

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
