package entity

import "gorm.io/gorm"


type Review_type struct {

   gorm.Model

   Review_Type string `json:"review_type"`

}