// app/api/auth/signup/route.ts
// POST -> create a customer account. Role always defaults to 'customer'
// (see handle_new_user() trigger in schema.sql) — never accept a role
// field from the client here.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password, full_name } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 422 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: data.user }, { status: 201 });
}
