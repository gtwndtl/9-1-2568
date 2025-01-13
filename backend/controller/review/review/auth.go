package review

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"team03/se67/config"
	"team03/se67/entity"
	"time"
)

// addReview represents the structure of the review data in the request body
type addReview struct {
	Review_date            time.Time `json:"review_date"`
	Review_text            string    `json:"review_text"`
	Service_rating         float32   `json:"service_rating"`
	Value_for_money_rating float32   `json:"value_for_money_rating"`
	Taste_rating           float32   `json:"taste_rating"`
	Cabin_rating           float32   `json:"cabin_rating"`
	Overall_rating         float32   `json:"overall_rating"`
	Recommended_dishes     string    `json:"recommended_dishes"`
	Pictures               []string  `gorm:"type:json;serializer:json" json:"pictures"` // ใช้ serializer
	ReviewTypeID           uint      `json:"review_type_id"`
	OrderID                uint      `json:"order_id"`
	FoodServicePaymentID   uint      `json:"food_service_payment_id"`
	BookingTripID          uint      `json:"booking_trip_id"`
	TripPaymentID          uint      `json:"trip_payment_id"`
	CustomerID             uint      `json:"customer_id"`
}

// AddReview handles the addition of a new review record
func AddReview(c *gin.Context) {
	var payload addReview

	// Bind JSON payload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// สร้าง Review ใหม่
	newReview := entity.Review{
		Review_date:            payload.Review_date,
		Review_text:            payload.Review_text,
		Service_rating:         payload.Service_rating,
		Value_for_money_rating: payload.Value_for_money_rating,
		Taste_rating:           payload.Taste_rating,
		Cabin_rating:           payload.Cabin_rating,
		Overall_rating:         payload.Overall_rating,
		Recommended_dishes:     payload.Recommended_dishes,
		Pictures:               payload.Pictures, // ใช้ []string โดยตรง
		ReviewTypeID:           payload.ReviewTypeID,
		OrderID:                payload.OrderID,
		FoodServicePaymentID:   payload.FoodServicePaymentID,
		BookingTripID:          payload.BookingTripID,
		TripPaymentID:          payload.TripPaymentID,
		CustomerID:             payload.CustomerID,
	}

	// บันทึกลงฐานข้อมูล
	if err := db.Create(&newReview).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":    201,
		"message":   "Review added successfully",
		"review_id": newReview.ID,
	})
}
