import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thender-frontend.vercel.app";
const siteUrl = rawSiteUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Thender — Decentralized Social Network",
    template: "%s | Thender", 
  },
  description:
    "A modern social media platform built on the Thender protocol. Connect, share, and communicate seamlessly.",
  keywords: ["Thender", "social network", "protocol", "web3", "chat", "media"],
  authors: [{ name: "Thender Team" }],
  creator: "Thender",
  
  icons: {
    icon: "/Logo.svg",
    shortcut: "/Logo.svg",
    apple: "/Logo.svg",
  },

  openGraph: {
    type: "website",
    locale: "en_US", 
    url: siteUrl,
    title: "Thender — Decentralized Social Network",
    description:
      "A modern social media platform built on the Thender protocol. Connect, share, and communicate seamlessly.",
    siteName: "Thender",
    images: [
      {
        url: `${siteUrl}/og-image.png`, 
        width: 1200,
        height: 630,
        type: "image/png", 
        alt: "Thender Social Media Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Thender — Decentralized Social Network",
    description:
      "A modern social media platform built on the Thender protocol.",
    images: [`${siteUrl}/og-image.png`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <GoogleOAuthProvider clientId={googleClientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}