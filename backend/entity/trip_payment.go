package entity

import (
	"time"

	"gorm.io/gorm"
)

type TripPayment struct {
	gorm.Model
	PaymentDate 	time.Time 		`valid:"required~PaymentDate is required"`
	TotalPrice 		float64			`valid:"-"`
	VAT             float64        	`valid:"-"`
	PaymentStatus	string			`valid:"required~PaymentStatus is required"`
	PaymentMethod	string			`valid:"required~PaymentMethod is required"`

	
	BookingCabinID uint				`valid:"required~BookingCabinID is required"`
	BookingCabin	*BookingCabin 	`gorm:"foreignKey:BookingCabinID;constraint:OnDelete:CASCADE;" valid:"-"`

	// PromotionID ทำหน้าที่เป็น FK
	PromotionID uint
	Promotion   *Promotion `gorm:"foreignKey:PromotionID;constraint:OnDelete:CASCADE;"`
}