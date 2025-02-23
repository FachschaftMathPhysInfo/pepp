FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm run codegen

COPY . .

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
