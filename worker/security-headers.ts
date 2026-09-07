import type { PortfolioWorkerEnv } from "./environment.ts";

export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
].join("; ");

export const responseSecurityHeaders = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

export function applyResponseSecurityHeaders(headers: Headers, env: PortfolioWorkerEnv) {
  for (const [name, value] of Object.entries(responseSecurityHeaders)) {
    headers.set(name, value);
  }

  if (env.DEPLOYMENT_ENV !== "production") {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return headers;
}
