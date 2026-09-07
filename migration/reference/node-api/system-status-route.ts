/**
 * Phase 23 Node API reference.
 *
 * This is intentionally outside `app/` so Next.js can emit a static export.
 * Phase 25 will port the route and status adapter to the API Worker.
 */
import { getSystemStatus } from "./system-status-adapter";

export async function GET() {
  const status = await getSystemStatus();

  return Response.json(status, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
