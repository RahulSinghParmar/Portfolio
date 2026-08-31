# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=https://rahulsinghparmar.site
ARG NEXT_PUBLIC_SITE_VERSION=v1.0.0
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_VERSION=${NEXT_PUBLIC_SITE_VERSION}
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ARG NEXT_PUBLIC_SITE_VERSION=v1.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_VERSION=${NEXT_PUBLIC_SITE_VERSION}
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

LABEL org.opencontainers.image.title="Rahul Singh Parmar Portfolio"
LABEL org.opencontainers.image.description="Production Next.js portfolio for infrastructure, network security, and automation work"
LABEL org.opencontainers.image.source="https://github.com/RahulSinghParmar/Portfolio"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.version=${NEXT_PUBLIC_SITE_VERSION}

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(4000)}).then((response)=>{if(!response.ok)throw new Error(String(response.status))}).catch(()=>process.exit(1))"]

CMD ["node", "server.js"]
