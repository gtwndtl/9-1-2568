package entity

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model

	Review_date        time.Time `json:"review_date"`
	Review_text        string    `gorm:"type:TEXT" json:"review_text"`
	Service_rating     float32   `json:"service_rating"`
	Price_rating       float32   `json:"price_rating"`
	Taste_rating       float32   `json:"taste_rating"`
	Overall_rating     float32   `json:"overall_rating"`
	Pictures           []string  `gorm:"type:json;serializer:json" json:"pictures"` // ใช้ serializer
	Recommended_dishes string    `json:"recommended_dishes"`

	ReviewTypeID uint         `json:"review_type_id"`
	ReviewType   *Review_type `gorm:"foreignKey: review_type_id" json:"review_type"`

	OrderID uint         `json:"order_id"`
	Order   *Review_type `gorm:"foreignKey: order_id" json:"order"`

	FoodServicePaymentID uint                `json:"food_service_payment_id"`
	FoodServicePayment   *FoodServicePayment `gorm:"foreignKey:food_service_payment_id" json:"food_service_payment"` // Referencing 'FoodServicePayment' struct from 'entity' package

	CustomerID uint       `json:"customer_id"`
	Customer   *Customers `gorm:"foreignKey:customer_id" json:"customer"` // Referencing 'Customers' struct from 'entity' package
}
