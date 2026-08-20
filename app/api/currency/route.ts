import { NextRequest, NextResponse } from "next/server";

// Vercel supplies x-vercel-ip-country in production. The storefront falls
// back to the browser locale/timezone when running locally.
export async function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  return NextResponse.json({ country, currency: country ? (country === "IN" ? "INR" : "USD") : null });
}
