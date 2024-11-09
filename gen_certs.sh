#!/usr/bin/env bash

set -euo pipefail

(
  cd ./tls/certs

  # root certs
  echo "Generating root certificates..."
  openssl genrsa -out root.key 4096
  openssl req -new -x509 -days 365 -subj "/CN=pepp" \
      -key root.key -out root.crt -config ../config/root.conf
  
  # server certs
  echo "Generating server certificates..."
  openssl genrsa -out server.key 4096
  openssl req -new -key server.key -subj "/CN=postgres" \
      -config ../config/server_client.conf -extensions req_ext -out server.csr
  openssl x509 -req -in server.csr -days 365 \
      -CA root.crt -CAkey root.key -CAcreateserial -out server.crt \
      -extfile ../config/server_client.conf -extensions req_ext
  
  echo "Setting correct server.key ownership."
  sudo chmod 600 server.key
  sudo chown 70:70 server.key
  
  # client certs
  echo "Generating client certificates..."
  openssl genrsa -out client.key 4096
  openssl req -new -key client.key -subj "/CN=client" \
      -config ../config/server_client.conf -extensions req_ext -out client.csr
  openssl x509 -req -in client.csr -days 365 \
      -CA root.crt -CAkey root.key -CAcreateserial -out client.crt \
      -extfile ../config/server_client.conf -extensions req_ext

  echo "Successfully created all certificates!"
  echo
)

echo "You can now start the application"
echo
echo "  docker compose up -d && docker compose logs -f"
