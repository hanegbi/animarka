FROM node:24-bookworm-slim

RUN npm install -g pnpm@11.17.0
WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY web ./
EXPOSE 3000
CMD ["./node_modules/.bin/next", "dev", "--hostname", "0.0.0.0"]
