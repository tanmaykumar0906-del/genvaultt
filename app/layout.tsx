import "./globals.css";

export const metadata = {
  title: "GenVault — Rare pieces. Your story.",
  description: "Curated men's thrift and streetwear. One-of-one pieces, built for your generation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
