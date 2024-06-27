// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Person interface {
	IsPerson()
	GetFn() string
	GetSn() string
	GetMail() string
	GetConfirmed() bool
}

type Mutation struct {
}

type NewStudent struct {
	Fn      string   `json:"fn"`
	Sn      string   `json:"sn"`
	Mail    string   `json:"mail"`
	Answers []string `json:"answers,omitempty"`
}

type Query struct {
}

type Student struct {
	Fn        string   `json:"fn"`
	Sn        string   `json:"sn"`
	Mail      string   `json:"mail"`
	Confirmed bool     `json:"confirmed"`
	Answers   []string `json:"answers"`
	Score     *int     `json:"score,omitempty"`
	Accepted  *bool    `json:"accepted,omitempty"`
}

func (Student) IsPerson()               {}
func (this Student) GetFn() string      { return this.Fn }
func (this Student) GetSn() string      { return this.Sn }
func (this Student) GetMail() string    { return this.Mail }
func (this Student) GetConfirmed() bool { return this.Confirmed }
