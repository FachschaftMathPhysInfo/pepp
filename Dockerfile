############################################
# Build the Next.js frontend
############################################
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/next.config.mjs ./

RUN npm install
COPY frontend/ .
COPY server/graph/schema.graphqls .
RUN npm run codegen
RUN npm run build


############################################
# Build the Go GraphQL server
############################################
FROM golang:1.23.0-bullseye AS server-build

WORKDIR /go/src

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ .
RUN go generate ./...
RUN CGO_ENABLED=0 go build -a -o graphql-server server.go


############################################
# Final image
############################################
FROM node:20-alpine AS final

WORKDIR /app

COPY --from=frontend-build /app/package*.json ./
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public

RUN npm install --production

COPY --from=server-build /go/src/graphql-server /usr/local/bin/graphql-server
EXPOSE 8080

CMD ["sh", "-c", "\
    graphql-server & \
    npm start \
"]
