package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	"github.com/FachschaftMathPhysInfo/pepp/server/utils"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/uptrace/bun"
	"golang.org/x/oauth2"
)

type ClaimMapping map[string]string

func GetOIDCClientConfig(ctx context.Context) (*oauth2.Config, *oidc.Provider, ClaimMapping, error) {
	issuer := utils.MustGetEnv("OIDC_LOGIN_PROVIDER_URL")
	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to connect to OIDC server: %w", err)
	}

	config := oauth2.Config{
		ClientID:     utils.MustGetEnv("OIDC_LOGIN_CLIENT_ID"),
		ClientSecret: utils.MustGetEnv("OIDC_LOGIN_CLIENT_SECRET"),
		RedirectURL:  utils.MustGetEnv("PUBLIC_URL") + "/sso/oidc/callback",
		Endpoint:     provider.Endpoint(),
		Scopes:       strings.Split(utils.MustGetEnv("OIDC_LOGIN_SCOPES"), " "),
	}

	raw := utils.MustGetEnv("OIDC_LOGIN_CLAIM_MAPPING")
	var mapping ClaimMapping
	if err := json.Unmarshal([]byte(raw), &mapping); err != nil {
		return nil, nil, nil, fmt.Errorf("failed to parse OIDC claim mapping: %w", err)
	}

	return &config, provider, mapping, nil
}

func HandleOIDCRedirect(w http.ResponseWriter, r *http.Request, config *oauth2.Config) {
	state, err := utils.RandString(16)
	if err != nil {
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}
	utils.SetCookie(w, r, "state", state)
	http.Redirect(w, r, config.AuthCodeURL(state), http.StatusFound)
}

func HandleOIDCCallback(w http.ResponseWriter, r *http.Request, ctx context.Context, provider *oidc.Provider, config *oauth2.Config, mapping ClaimMapping, db *bun.DB) {
	stCookie, err := r.Cookie("state")
	if err != nil {
		http.Error(w, "state not found", http.StatusBadRequest)
		return
	}
	if r.URL.Query().Get("state") != stCookie.Value {
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

	var claims map[string]interface{}
	if err := userInfo.Claims(&claims); err != nil {
		http.Error(w, "Failed to parse claims: "+err.Error(), http.StatusInternalServerError)
		return
	}

	user := models.User{
		Confirmed: true,
		Password:  "",
	}

	getString := func(key string) string {
		if claimKey, ok := mapping[key]; ok {
			if v, found := claims[claimKey]; found {
				if s, ok := v.(string); ok {
					return s
				}
			}
		}
		return ""
	}

	user.Mail = getString("mail")
	name := getString("name")
	if name != "" {
		splitted := strings.SplitN(name, " ", 2)
		user.Fn = splitted[0]
		user.Sn = splitted[1]
	} else {
		user.Fn = getString("fn")
		user.Sn = getString("sn")
	}

	sid, err := verifySsoUser(ctx, db, user)
	if err != nil {
		http.Error(w, "Failed to verify sso user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, fmt.Sprintf("%s?sid=%s", utils.MustGetEnv("PUBLIC_URL"), sid), http.StatusFound)
}
