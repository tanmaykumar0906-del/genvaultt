// app/api/products/route.ts
// GET  -> public: list live products (filter by category/collection/tag)
// POST -> admin only: create a product
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const tag = searchParams.get("tag");
  const featured = searchParams.get("featured");

  let query = supabase
    .from("products")
    .select("*, category:categories(name,slug), images:product_images(storage_path,position,alt_text)")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("categories.slug", category);
  if (collection) query = query.eq("collections.slug", collection);
  if (tag) query = query.contains("tags", [tag]);
  if (featured) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const required = ["name", "slug", "price_paise"];
  for (const field of required) {
    if (body[field] === undefined) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 422 });
    }
  }

  const { data, error } = await supabase.from("products").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data }, { status: 201 });
}
