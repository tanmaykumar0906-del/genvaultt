// app/api/auth/reset-password/route.ts
// POST -> send a "forgot password" email with a reset link.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 422 });

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Always return ok — don't leak whether the email exists.
  return NextResponse.json({ ok: true });
}
