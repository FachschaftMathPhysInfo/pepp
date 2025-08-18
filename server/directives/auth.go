package directives

import (
	"context"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	log "github.com/sirupsen/logrus"
)

func Auth(ctx context.Context, obj interface{}, next graphql.Resolver, rule *model.Rule, role *model.Role) (res interface{}, err error) {
	err = fmt.Errorf("Access denied")

	authenticatedUser, _ := ctx.Value("user").(*models.User)

	if model.Role(authenticatedUser.Role) == model.RoleAdmin {
		return next(ctx)
	}

	if role != nil && model.Role(authenticatedUser.Role) != *role {
		return nil, err
	}

	switch *rule {
	case model.RuleIsUser:
		mail, _ := next(ctx)
		id, _ := next(ctx)

		args := graphql.GetFieldContext(ctx).Args
		if mails, ok := args["mail"].([]string); ok && len(mails) == 1 {
			mail = mails[0]
		}

		if ids, ok := args["id"].([]int); ok && len(ids) == 1 {
			id = ids[0]
		}

		if ids, ok := args["userID"].([]int); ok && len(ids) == 1 {
			id = ids[0]
		}
		log.Info(id)
		log.Info(authenticatedUser.ID)

		if mail != authenticatedUser.Mail && mail != authenticatedUser.SessionID && id != int(authenticatedUser.ID) {
			log.Info("Access denied for ", authenticatedUser.Mail)
			return nil, err
		}
		// TODO: model.RuleIsTutor
	}

	return next(ctx)
}
