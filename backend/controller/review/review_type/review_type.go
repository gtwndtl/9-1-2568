package review_type

import (
	"net/http"

	"team03/se67/config"
	"team03/se67/entity"
	"github.com/gin-gonic/gin"
)

// GetAll retrieves all review types from the database.
func GetAll(c *gin.Context) {
	db := config.DB()

	var reviewTypes []entity.Review_type
	db.Find(&reviewTypes)

	c.JSON(http.StatusOK, &reviewTypes)
}

// Get retrieves a specific review type by its ID.
func Get(c *gin.Context) {
	ID := c.Param("id")

	var singleReviewType entity.Review_type

	db := config.DB()
	results := db.First(&singleReviewType, ID)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	if singleReviewType.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}

	c.JSON(http.StatusOK, singleReviewType)
}
