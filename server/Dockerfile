FROM golang:1.21.3-bullseye AS build

WORKDIR /go/src

COPY go.mod go.sum ./
RUN go mod download

COPY graph ./graph
COPY server.go ./server.go
COPY utils ./utils

RUN CGO_ENABLED=0 go build -a -o graphql-server server.go

FROM gcr.io/distroless/static-debian11
COPY --from=build /go/src/graphql-server /
ENTRYPOINT ["/graphql-server"]
