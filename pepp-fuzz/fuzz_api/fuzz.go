package fuzz_api

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type GraphQLRequest struct {
	Query     string         `json:"query"`
	Variables map[string]any `json:"variables,omitempty"`
}

func Fuzz(data []byte) int {
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

// TODO: Implement Data Leak Detection in the Fuzz Function
//
// Current Fuzz Functionality:
// - Unmarshals fuzz data into a GraphQLRequest.
// - Sends this request to "http://localhost:8080/api".
// - Returns the HTTP status code of the response.
//
// Goal:
// - Enhance the Fuzz function to detect potential data leaks by inspecting
//   the GraphQL response body for predefined sensitive patterns.
// - If a leak is detected, the function should panic with details so go-fuzz
//   saves the input.
// - Adjust the return value to be `0` (discard input) or `1` (keep input for
//   coverage) as expected by go-fuzz, instead of `resp.StatusCode`.
//
// Implementation Steps:
//
//
// 1.  Define Sensitive Data Patterns:
//     - Globally (or in an `init()` function within this package), define a slice
//       of compiled regular expressions (`var sensitivePatterns []*regexp.Regexp`).
//       Example: `regexp.MustCompile(`(?i)mail`)`.
//       These patterns will identify what constitutes sensitive data in the responses.
//
// 2.  After `resp, err := client.Do(req)` and error handling for `err`:
//     a.  Read the Response Body:
//         - Before `defer resp.Body.Close()`, or just after it if it's re-opened,
//           read the full response body using `io.ReadAll(resp.Body)`.
//           Store it in a `[]byte` variable (e.g., `responseBodyBytes`).
//         - Handle potential errors from `io.ReadAll`. If an error occurs,
//           probs best to `return 0`, but that needs some thoughts.
//         - Convert `responseBodyBytes` to a string (e.g., `responseBodyStr`).
//
//     b.  Perform Pattern Matching:
//         - Iterate through your predefined `sensitivePatterns`.
//         - For each pattern, use `pattern.MatchString(responseBodyStr)` to check
//           if the sensitive data is present in the response.
//
//     c.  Panic on Leak Detection:
//         - If a pattern matches:
//             - Construct a descriptive panic message.
//               Include:
//                 - A clear "Potential data leak detected!" header.
//                 - The specific regex pattern that matched (`pattern.String()`).
//                 - The original GraphQL query (`reqBody.Query`).
//                 - The HTTP status code (`resp.StatusCode`).
//                 - A snippet of the `responseBodyStr` (or the full string if a
//                   snippet function isn't implemented yet).
//             - Call `panic(yourDescriptiveMessage)`. `go-fuzz` will then save this
//               input in the `crashers` directory.
//
// 3.  Adjust Function Return Value (this replaces the current `return resp.StatusCode`):
//     - If the code reaches this point (i.e., no panic/leak was detected):
//         - If `resp.StatusCode` indicates success (e.g., `resp.StatusCode >= 200 && resp.StatusCode < 300`):
//             Return `1` (tells `go-fuzz` to keep this input as it might provide new coverage
//             and was processed successfully without leaks).
//         - Otherwise (e.g., server-side error like 4xx, 5xx, or other non-successful codes where no leak was found):
//             Return `0` (tells `go-fuzz` to discard this input).
//     - The existing `return 0` statements for JSON errors, request creation errors,
//       and client.Do errors are appropriate for discarding those inputs.
//
// 4.  Implement Helper Function for Snippets:
//     - Create a small helper function `getSnippet(text string, maxLength int) string`
//       to include a manageable piece of the response in the panic message, making
//       reports cleaner.
//
//
// Post-Implementation:
// - Adjust the python script to parse and filter all the results from the fuzzing
