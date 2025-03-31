FROM node:20-alpine AS builder

COPY server/graph/schema.graphqls /app/schema.graphqls

WORKDIR /app

COPY frontend/ .

RUN npm install
RUN npm run codegen
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN npm install --production

EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

CMD ["npm", "start"]
