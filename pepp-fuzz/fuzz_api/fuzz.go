package fuzz_api

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

func Fuzz(data []byte) int {
	// Try to unmarshal fuzz data as a GraphQL request
	var reqBody GraphQLRequest
	if err := json.Unmarshal(data, &reqBody); err != nil {
		return 0 // Not valid JSON, skip
	}
	if reqBody.Query == "" {
		return 0 // Not a GraphQL request, skip
	}

	// Marshal back to JSON for sending
	payload, err := json.Marshal(reqBody)
	if err != nil {
		return 0
	}

	req, err := http.NewRequest("POST", "http://localhost:8080/api", bytes.NewBuffer(payload))
	if err != nil {
		return 0
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0
	}
	defer resp.Body.Close()
	return resp.StatusCode
}
