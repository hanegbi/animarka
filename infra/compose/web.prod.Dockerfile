# Production web image: build once, run `next start`. The API origin is baked into the rewrites at build time.
FROM node:24-bookworm-slim AS build
RUN npm install -g pnpm@11.17.0
WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY web ./
ARG API_ORIGIN=http://api:8000
ENV API_ORIGIN=$API_ORIGIN NEXT_TELEMETRY_DISABLED=1
RUN pnpm build && pnpm prune --prod

FROM node:24-bookworm-slim
WORKDIR /app/web
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/web/package.json ./
COPY --from=build /app/web/node_modules ./node_modules
COPY --from=build /app/web/.next ./.next
COPY --from=build /app/web/public ./public
COPY --from=build /app/web/next.config.ts ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["./node_modules/.bin/next", "start", "--hostname", "0.0.0.0", "--port", "3000"]
