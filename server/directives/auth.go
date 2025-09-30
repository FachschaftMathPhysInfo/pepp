package directives

import (
	"context"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/FachschaftMathPhysInfo/pepp/server/graph/model"
	"github.com/FachschaftMathPhysInfo/pepp/server/models"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func Auth(ctx context.Context, obj interface{}, next graphql.Resolver, rule *model.Rule, role *model.Role, db *bun.DB, env string) (res interface{}, err error) {
	err = fmt.Errorf("Access denied")

	authenticatedUser, _ := ctx.Value("user").(*models.User)

	if model.Role(authenticatedUser.Role) == model.RoleAdmin || env != "Production" {
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

		if mail != authenticatedUser.Mail && mail != authenticatedUser.SessionID && id != int(authenticatedUser.ID) {
			log.Info("Access denied for ", authenticatedUser.Mail)
			return nil, err
		}
	case model.RuleIsTutor:
		tut, ok := obj.(*models.Tutorial)
		if !ok {
			return nil, fmt.Errorf("invalid object for directive")
		}

		exists, err := db.NewSelect().
			Model((*models.TutorialToUserAssignment)(nil)).
			Where("user_id = ?", authenticatedUser.ID).
			Where("tutorial_id = ?", tut.ID).
			Exists(ctx)
		if err != nil {
			log.Error(err)
			return nil, fmt.Errorf("error while checking for tutor to tutorial relation")
		}
		if !exists {
			return nil, fmt.Errorf("user is not permitted to query for this tutorials students")
		}
	}

	return next(ctx)
}
