// app/api/auth/login/route.ts
// POST -> log in. Same endpoint serves both customers and admins —
// the ADMIN LOGIN page (per the brief) just calls this too, then
// middleware.ts + the /admin route group enforce that only accounts
// with role = 'admin' can actually reach /admin/*. A customer who
// logs in through the admin page simply gets redirected away.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 422 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({ user: data.user, role: profile?.role ?? "customer" });
}
