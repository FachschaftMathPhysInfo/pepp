package graph

import "fmt"

var ErrInternal = fmt.Errorf("internal server error")
var ErrWrongCredentials = fmt.Errorf("incorrect credentials provided")