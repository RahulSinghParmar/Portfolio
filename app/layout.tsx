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
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
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
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteMetadata.socialImageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.socialDescription,
    creator: siteMetadata.twitterHandle,
    images: [
      {
        url: "/twitter-image.png",
        width: 1200,
        height: 630,
        alt: siteMetadata.socialImageAlt,
      },
    ],
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
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

const themeInitializationScript = `(function(){try{var k="rsp-theme",p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var t=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#f3f1e9":"#0b0c0c")}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.dataset.themePreference="system"}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteMetadata.language}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0b0c0c" suppressHydrationWarning />
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
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
