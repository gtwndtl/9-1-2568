package entity


import "gorm.io/gorm"


type Status struct {

   gorm.Model

   Status string `json:"stat"`

}