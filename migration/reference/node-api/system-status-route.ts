/**
 * Retired Node API reference.
 *
 * This is intentionally outside `app/` so Next.js can emit a static export.
 * The active route and status adapter now live under worker/.
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
