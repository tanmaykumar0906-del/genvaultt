import "./globals.css";

import Script from "next/script"
export const metadata = {
  metadataBase: new URL("https://genvaultt.vercel.app"),

  title: {
    default: "GenVault — Rare Pieces. Your Story.",
    template: "%s | GenVault",
  },

  description:
    "Discover rare thrift and streetwear pieces at GenVault. Curated oversized cargos, vintage finds, Y2K styles, and one-of-a-kind pieces made for your generation.",

  keywords: [
    "GenVault",
    "thrift fashion",
    "streetwear",
    "baggy cargo pants",
    "oversized clothing",
    "vintage streetwear",
    "Y2K fashion",
    "men's streetwear",
    "rare fashion pieces",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "GenVault — Rare Pieces. Your Story.",
    description:
      "Discover rare thrift and streetwear pieces. Find your next statement piece at GenVault.",
    url: "https://genvaultt.vercel.app/",
    siteName: "GenVault",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/hero-background.png",
        width: 1200,
        height: 630,
        alt: "GenVault — Rare thrift and streetwear",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "GenVault — Rare Pieces. Your Story.",
    description:
      "Discover rare thrift and streetwear pieces at GenVault.",
    images: ["/images/hero-background.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-DM6LBMKF09"
        strategy="afterInteractive"
      />

      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DM6LBMKF09');
        `}
      </Script>


      {/* GenVault SEO Structured Data */}
      <script
        id="genvault-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://genvaultt.vercel.app/#website",
                name: "GenVault",
                url: "https://genvaultt.vercel.app/",
                description:
                  "Curated thrift and streetwear featuring rare and one-of-a-kind fashion pieces."
              },
              {
                "@type": "Organization",
                "@id": "https://genvaultt.vercel.app/#organization",
                name: "GenVault",
                url: "https://genvaultt.vercel.app/",
                description:
                  "GenVault is a curated thrift and streetwear store featuring rare and one-of-a-kind fashion pieces."
              }
            ]
          })
        }}
      />


      {/* Microsoft Clarity */}
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
      >
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "y5qzwx2trf");
        `}
      </Script>


      {/* Meta Pixel */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');

          fbq('init', '2156358715758481');
          fbq('track', 'PageView');
        `}
      </Script>
{children}</body>
    </html>
  );
}