FROM node:22-alpine AS builder
WORKDIR /app
ENV CI=true
RUN npm i -g pnpm
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY svelte.config.js ./
RUN pnpm install
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
EXPOSE 3000
ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000
CMD [ "node", "build" ]