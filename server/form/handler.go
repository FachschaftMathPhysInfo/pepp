package form

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"google.golang.org/api/forms/v1"
	"google.golang.org/api/option"
)

func HandleGoogleLogin(w http.ResponseWriter, r *http.Request, config *oauth2.Config) {
	url := config.AuthCodeURL(os.Getenv("OAUTH_STATE_STRING"))
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func HandleGoogleCallback(ctx context.Context, w http.ResponseWriter, r *http.Request, config *oauth2.Config) (*forms.FormsService, error) {
	state := r.FormValue("state")
	oauthStateString := os.Getenv("OAUTH_STATE_STRING")
	if state != oauthStateString {
		return nil, fmt.Errorf("invalid oauth state, expected '%s', got '%s'\n", oauthStateString, state)
	}

	code := r.FormValue("code")
	token, err := config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("could not get token: %s\n", err.Error())
	}

	client := config.Client(ctx, token)
	srv, err := forms.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		fmt.Fprintf(w, "unable to create forms client: %s", err)
	}
	return srv.Forms, nil
}
