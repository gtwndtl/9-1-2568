package promotion_used

import (
	"net/http"

	"team03/se67/config"
	"team03/se67/entity"

	"github.com/gin-gonic/gin"
)


func GetAll(c *gin.Context) {


   db := config.DB()


   var used []entity.Promotion_Used

   db.Find(&used)


   c.JSON(http.StatusOK, &used)


}

func Get(c *gin.Context) {


   ID := c.Param("id")

   var Used entity.Promotion_Used


   db := config.DB()
   results := db.First(&Used, ID)

   if results.Error != nil {

       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

       return

   }

   if Used.ID == 0 {

       c.JSON(http.StatusNoContent, gin.H{})

       return

   }

   c.JSON(http.StatusOK, Used)


}

func Update(c *gin.Context) {


	var Used entity.Promotion_Used
 
 
	UsedID := c.Param("id")
 
 
	db := config.DB()
 
	result := db.First(&Used, UsedID)
 
	if result.Error != nil {
 
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
 
		return
 
	}
 
 
	if err := c.ShouldBindJSON(&Used); err != nil {
 
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
 
		return
 
	}
 
 
	result = db.Save(&Used)
 
	if result.Error != nil {
 
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
 
		return
 
	}
 
 
	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
 
 }
 
 
 func Delete(c *gin.Context) {
 
 
	 id := c.Param("id")
  
	 db := config.DB()
  
	 if tx := db.Exec("DELETE FROM promotion_used WHERE id = ?", id); tx.RowsAffected == 0 {
  
		 c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
  
		 return
  
	 }
  
	 c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
  
  }
  