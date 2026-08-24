import Link from "next/link";

export const metadata = {
  title: "About GenVault",
  description:
    "Learn about GenVault, a curated destination for rare thrift, vintage and streetwear pieces that deserve a second life.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "100px 24px",
      }}
    >
      <Link href="/">← Back to GenVault</Link>

      <p
        style={{
          marginTop: "60px",
          letterSpacing: "3px",
          fontSize: "12px",
        }}
      >
        ABOUT
      </p>

      <h1
        style={{
          fontSize: "48px",
          marginTop: "20px",
        }}
      >
        GenVault is a curated archive of pieces that deserve a second life.
      </h1>

      <div
        style={{
          marginTop: "40px",
          lineHeight: "1.8",
          fontSize: "18px",
        }}
      >
        <p>
          We look for clothing with character — pieces that were made well,
          worn in, and forgotten in the wrong closet.
        </p>

        <p>
          Every item is inspected, measured, and photographed before it goes
          live. Nothing here is mass produced.
        </p>

        <p>
          Nothing here is reprinted. Nothing here is restocked. When a piece is
          gone, it is gone.
        </p>

        <p>
          GenVault is about finding something rare and giving great clothing
          another story.
        </p>
      </div>

      <div style={{ marginTop: "50px" }}>
        <Link href="/products">Explore the collection →</Link>
      </div>
    </main>
  );
}
