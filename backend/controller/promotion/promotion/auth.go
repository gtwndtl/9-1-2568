package promotion

import (
	"errors"
	"net/http"
	"time"

	"team03/se67/config"
	"team03/se67/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// addPromotion represents the structure of the promotion data in the request body
type addPromotion struct {
	Name            string    `json:"name"`
	Details         string    `json:"details"`
	Code            string    `json:"code"`
	Start_date      time.Time `json:"start_date"`
	End_date        time.Time `json:"end_date"`
	Discount        float32   `json:"discount"`
	Minimum_price   float32   `json:"minimum_price"`
	Limit           uint      `json:"limit"`
	Count_Limit     uint      `json:"count_limit"`
	Limit_discount  float32   `json:"limit_discount"`
	DiscountID      uint      `json:"discount_id"`
	TypeID          uint      `json:"type_id"`
	StatusID        uint      `json:"status_id"`
}

// AddPromotion handles the addition of a new promotion record
func AddPromotion(c *gin.Context) {
	var payload addPromotion

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that Start_date is before End_date
	if payload.Start_date.After(payload.End_date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date must be before end date"})
		return
	}

	db := config.DB()

	var codeCheck entity.Promotion

	// Check if the promotion with the provided code already exists
	result := db.Where("code = ? AND type_id = ?", payload.Code, payload.TypeID).First(&codeCheck)
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Handle database error
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if codeCheck.ID != 0 {
		// If a promotion with the same code exists
		c.JSON(http.StatusConflict, gin.H{"status": 409, "error": "Promotion with this code already exists"})
		return
	}

	// Create new promotion record
	newPromotion := entity.Promotion{
		Name:           payload.Name,
		Details:        payload.Details,
		Code:           payload.Code,
		Start_date:     payload.Start_date,
		End_date:       payload.End_date,
		Discount:       payload.Discount,
		Minimum_price:  payload.Minimum_price,
		Limit:          payload.Limit,
		Count_Limit:    payload.Count_Limit,
		Limit_discount: payload.Limit_discount,
		DiscountID:     payload.DiscountID,
		TypeID:         payload.TypeID,
		StatusID:       payload.StatusID,
	}

	// Save the promotion record to the database
	if err := db.Create(&newPromotion).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return the promotion ID in the response
	c.JSON(http.StatusCreated, gin.H{
		"status":       201,
		"message":      "Promotion added successfully",
		"promotion_id": newPromotion.ID,
	})

	
}
