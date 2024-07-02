package models

type Student struct {
	User `bun:",inherit"`

	Answers []Answer `bun:"rel:has-many,join:mail=student_mail"`
}

func (Student) IsUser()                 {}
func (this Student) GetFn() string      { return this.Fn }
func (this Student) GetSn() string      { return this.Sn }
func (this Student) GetMail() string    { return this.Mail }
func (this Student) GetConfirmed() bool { return this.Confirmed }
