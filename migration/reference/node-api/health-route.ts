/**
 * Phase 23 Node API reference.
 *
 * This is intentionally outside `app/` so Next.js can emit a static export.
 * Phase 25 will replace it with an edge-native health handler.
 */
export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "rahul-singh-parmar-portfolio",
      version: process.env.NEXT_PUBLIC_SITE_VERSION ?? "v1.0.0",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
