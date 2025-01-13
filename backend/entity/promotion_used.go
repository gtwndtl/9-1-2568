package entity

import (
	"gorm.io/gorm"
)

type Promotion_Used struct {
	gorm.Model

	PromotionID uint `json:"promotion_id"`
	Promotion   *Promotion `gorm:"foreignKey:promotion_id" json:"promotion"`

	CustomerID uint `json:"customer_id"`
	Customer   *Customers `gorm:"foreignKey:customer_id" json:"customer"`

	FoodServicePaymentID uint `json:"food_service_payment_id"`
	FoodServicePayment   *FoodServicePayment `gorm:"foreignKey:food_service_payment_id" json:"food_service_payment"`
	
	TripPaymentID uint `json:"trip_payment_id"`
	TripPayment   *TripPayment `gorm:"foreignKey:trip_payment_id" json:"trip_payment"`
}
