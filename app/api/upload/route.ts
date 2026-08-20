// app/api/upload/route.ts
// POST -> admin only: upload a real product photo to Supabase Storage
// and attach it to a product via product_images.
//
// Expects multipart/form-data:
//   file        -> the image file
//   product_id  -> uuid of the product this image belongs to
//   position    -> optional sort order (0 = primary image)
//   alt_text    -> optional accessibility text
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("product_id") as string | null;
  const position = Number(formData.get("position") ?? 0);
  const altText = (formData.get("alt_text") as string) ?? "";

  if (!file || !productId) {
    return NextResponse.json({ error: "file and product_id are required" }, { status: 422 });
  }

  const ext = file.name.split(".").pop();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data: row, error: dbError } = await supabase
    .from("product_images")
    .insert({ product_id: productId, storage_path: path, position, alt_text: altText })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);

  return NextResponse.json({ image: row, url: publicUrl.publicUrl }, { status: 201 });
}
