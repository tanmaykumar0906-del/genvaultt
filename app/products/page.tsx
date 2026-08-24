import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Shop curated thrift, vintage and streetwear pieces from GenVault.",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return (
    <main style={{ padding: "100px 10%", minHeight: "80vh" }}>
      <p style={{ letterSpacing: "3px", fontSize: "12px" }}>
        GENVAULT COLLECTION
      </p>

      <h1 style={{ fontSize: "clamp(40px, 6vw, 80px)", marginTop: "20px" }}>
        SHOP THE VAULT.
      </h1>

      <p
        style={{
          maxWidth: "700px",
          fontSize: "18px",
          lineHeight: "1.7",
        }}
      >
        Explore curated thrift, vintage and streetwear pieces. Every item is
        selected for its character, fit and individuality.
      </p>

      <div style={{ marginTop: "40px" }}>
        <Link href="/">← Back to GenVault</Link>
      </div>
    </main>
  );
}
