package entity

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model

	Review_date            time.Time `json:"review_date"`
	Review_text            string    `gorm:"type:TEXT" json:"review_text"`
	Service_rating         float32   `json:"service_rating"`
	Value_for_money_rating float32   `json:"value_for_money_rating"`
	Taste_rating           float32   `json:"taste_rating"`
	Cabin_rating           float32   `json:"cabin_rating"`
	Overall_rating         float32   `json:"overall_rating"`
	Pictures               []string  `gorm:"type:json;serializer:json" json:"pictures"` // ใช้ serializer
	Recommended_dishes     string    `json:"recommended_dishes"`

	ReviewTypeID uint         `json:"review_type_id"`
	ReviewType   *Review_type `gorm:"foreignKey: review_type_id" json:"review_type"`

	OrderID uint         `json:"order_id"`
	Order   *Review_type `gorm:"foreignKey: order_id" json:"order"`

	FoodServicePaymentID uint                `json:"food_service_payment_id"`
	FoodServicePayment   *FoodServicePayment `gorm:"foreignKey:food_service_payment_id" json:"food_service_payment"` // Referencing 'FoodServicePayment' struct from 'entity' package

	BookingTripID uint         `json:"booking_trip_id"`
	BookingTrip   *BookingTrip `gorm:"foreignKey:booking_trip_id" json:"booking_trip"`

	TripPaymentID uint         `json:"trip_payment_id"`
	TripPayment   *TripPayment `gorm:"foreignKey:trip_payment_id" json:"trip_payment"`

	CustomerID uint       `json:"customer_id"`
	Customer   *Customers `gorm:"foreignKey:customer_id" json:"customer"` // Referencing 'Customers' struct from 'entity' package
}
