import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { SiteNavigation } from "@/components/navigation/site-navigation";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { profile } from "@/data/profile";
import { siteMetadata } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: siteMetadata.title,
    template: "%s — Rahul Singh Parmar",
  },
  description: siteMetadata.description,
  applicationName: `${profile.name} — Portfolio`,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  category: "technology",
  keywords: [...siteMetadata.keywords],
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
    languages: { "en-IN": "/" },
  },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "profile",
    locale: siteMetadata.locale,
    url: profile.siteUrl,
    title: siteMetadata.title,
    description: siteMetadata.socialDescription,
    siteName: profile.name,
    firstName: profile.givenName,
    lastName: profile.familyName,
    username: "RahulSinghParmar",
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.socialDescription,
    creator: siteMetadata.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0b0c0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteMetadata.language} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteNavigation />
        {children}
        <MotionRuntime />
      </body>
    </html>
  );
}
