// app/api/admin/dashboard/route.ts
// GET -> admin only: overview numbers for the dashboard home
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [{ count: productCount }, { count: liveCount }, { count: orderCount }, { count: customerCount }, { count: postCount }, { data: revenueRows }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "live"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_paise").in("status", ["paid", "packed", "shipped", "delivered"]),
    ]);

  const revenuePaise = (revenueRows ?? []).reduce((sum, o) => sum + o.total_paise, 0);

  return NextResponse.json({
    products: productCount ?? 0,
    liveProducts: liveCount ?? 0,
    orders: orderCount ?? 0,
    customers: customerCount ?? 0,
    blogPosts: postCount ?? 0,
    revenuePaise,
  });
}
