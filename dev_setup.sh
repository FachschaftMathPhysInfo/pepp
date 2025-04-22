#!/bin/bash

# Move into the server directory
cd server || { echo "Failed to navigate to server directory"; exit 1; }

# # Generate code (only needed on initial startup or schema.graphql changes)
echo "Running 'go generate'..."
go generate ./... || { echo "'go generate' failed"; exit 1; }

# Start the server and redirect logs to a file
echo "Starting the server..."
LOG_FILE="server.log"
go run server.go > "$LOG_FILE" 2>&1 &

# Wait for the server to start
echo "Waiting for the server to start..."
sleep 5

# Display the logs so the admin password can be retrieved
echo "Server logs:"
tail -n 20 "$LOG_FILE"

# Prompt for the admin password
read -p "Enter the generated admin password (check the logs above): " ADMIN_PASSWORD

# Login to get the session ID using curl
echo "Logging in to retrieve session ID..."
# LOGIN_RESPONSE=$(curl -s -X POST \
#   -H "Content-Type: application/json" \
#   -d '{"query": "mutation { login(mail: \"admin@pepp.local\", password: \"'"$ADMIN_PASSWORD"'\") { token } }"}' \
#   http://localhost:8080/graphql)
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ login(mail: \"admin@pepp.local\", password: \"fcmXLKLTzNWQKZEvjrmt20t1DNE3m2jzEBFmFRCoPPo\") { token } }"}' \
  http://localhost:8080/graphql
# # Extract the token (session ID) from the response
SESSION_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.login.token')

 if [ -z "$SESSION_ID" ]; then
   echo "Failed to retrieve session ID. Please check your admin password or server status."
   exit 1
 fi

 echo "Session ID retrieved: $SESSION_ID"

# Prepare the GraphQL mutation for example data
#EXAMPLE_DATA_MUTATION='mutation exampleData {
#   tutor1: addUser(user: {mail: "tutor1@example.de", fn: "Tutorin", sn: "One", password: "test1"})
#   tutor2: addUser(user: {mail: "tutor2@example.de", fn: "Tutor", sn: "Two", password: "test2"})
#   mmk: addBuilding(
#     building: {name: "Mathematikon", street: "INF", number: "205", city: "Heidelberg", zip: "69115", latitude: 49.417493, longitude: 8.675197, zoomLevel: 17}
#   ) {
#     ID
#   }
#   kip: addBuilding(
#     building: {name: "Kirchhoff-Institut für Physik", street: "INF", number: "227", city: "Heidelberg", zip: "69115", latitude: 49.4162501, longitude: 8.6694734, zoomLevel: 17}
#   ) {
#     ID
#   }
#   # Additional mutation data omitted for brevity, add the rest here
# }'

# # Send the mutation using curl
# echo "Sending example data mutation..."
# curl -X POST \
#   -H "Content-Type: application/json" \
#   -H "SID: $SESSION_ID" \
#   -d "{\"query\": \"$EXAMPLE_DATA_MUTATION\"}" \
#   http://localhost:8080/graphql || { echo "Example data mutation failed"; exit 1; }

# echo "Example data successfully added."
