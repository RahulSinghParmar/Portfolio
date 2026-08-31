import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Route not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="not-found section-grid" id="main-content" tabIndex={-1}>
      <p className="mono-meta">ERROR / ROUTE / 404</p>
      <h1>Node not found.</h1>
      <p>The requested route is outside the current network.</p>
      <Link className="focus-ring" href="/">
        Return to network
      </Link>
    </main>
  );
}
