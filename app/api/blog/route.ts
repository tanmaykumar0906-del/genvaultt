// app/api/blog/route.ts
// GET  -> public: published posts (admin gets drafts too)
// POST -> admin only: create a post (rich-text `content` as JSON blocks)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let query = supabase
    .from("blog_posts")
    .select("*, category:blog_categories(name,slug)")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (category) query = query.eq("blog_categories.slug", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  if (!body.title || !body.slug) {
    return NextResponse.json({ error: "title and slug are required" }, { status: 422 });
  }

  const payload = {
    ...body,
    author_id: user.id,
    published_at: body.status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data }, { status: 201 });
}
