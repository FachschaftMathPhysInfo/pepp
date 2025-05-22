package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

func setCallbackCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	c := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   r.TLS != nil,
		HttpOnly: true,
	}
	http.SetCookie(w, c)
}

func GetOIDCClientConfig(ctx context.Context) (*oauth2.Config, *oidc.Provider, map[string]string, error) {
	url := utils.MustGetEnv("OIDC_LOGIN_PROVIDER_URL")
	provider, err := oidc.NewProvider(ctx, url)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to connect to oidc server:", err)
	}

	config := oauth2.Config{
		ClientID:     utils.MustGetEnv("OIDC_LOGIN_CLIENT_ID"),
		ClientSecret: utils.MustGetEnv("OIDC_LOGIN_CLIENT_SECRET"),
		RedirectURL:  utils.MustGetEnv("PUBLIC_URL") + "/sso/oidc/callback",
		Endpoint:     provider.Endpoint(),
		Scopes:       strings.Split(utils.MustGetEnv("OIDC_LOGIN_SCOPES"), " "),
	}

	//raw := utils.MustGetEnv("OIDC_LOGIN_CLAIM_MAPPING")
	var m map[string]string
	//if err := json.Unmarshal([]byte(raw), &m); err != nil {
	//	return nil, nil, nil, fmt.Errorf("failed to parse oidc claim mapping:", err)
	//}

	return &config, provider, m, nil
}

func HandleOIDCRedirect(w http.ResponseWriter, r *http.Request, config *oauth2.Config) {
	state, err := utils.RandString(16)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	setCallbackCookie(w, r, "state", state)

	http.Redirect(w, r, config.AuthCodeURL(state), http.StatusFound)
}

func HandleOIDCCallback(w http.ResponseWriter, r *http.Request, ctx context.Context, provider *oidc.Provider, config *oauth2.Config) {
	state, err := r.Cookie("state")
	if err != nil {
		http.Error(w, "state not found", http.StatusBadRequest)
		return
	}
	if r.URL.Query().Get("state") != state.Value {
		http.Error(w, "state did not match", http.StatusBadRequest)
		return
	}

	oauth2Token, err := config.Exchange(ctx, r.URL.Query().Get("code"))
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userInfo, err := provider.UserInfo(ctx, oauth2.StaticTokenSource(oauth2Token))
	if err != nil {
		http.Error(w, "Failed to get userinfo: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := struct {
		OAuth2Token *oauth2.Token
		UserInfo    *oidc.UserInfo
	}{oauth2Token, userInfo}
	data, err := json.MarshalIndent(resp, "", "    ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(data)
}
