package promotion


import (

   "net/http"
   "time"
   "github.com/gin-gonic/gin"


   "team03/se67/config"

   "team03/se67/entity"

)


func GetAll(c *gin.Context) {
	var promotions []entity.Promotion

	db := config.DB()
	results := db.Find(&promotions)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	// เช็คโปรโมชั่นที่หมดอายุแล้วและอัพเดท status_id เป็น 3 (หมดอายุ)
	currentDate := time.Now()

	// ตรวจสอบให้แน่ใจว่าเวลาของวันหมดอายุคือ 23:59:59 ของวันนั้น
	for _, promo := range promotions {
		if promo.End_date.Before(currentDate) && promo.End_date.YearDay() != currentDate.YearDay() {
			// เปรียบเทียบวันหมดอายุถ้าผ่านเวลาแล้วจึงอัพเดทสถานะเป็น 3 (หมดอายุ)
			// สร้างเวลาของวันหมดอายุเป็นเวลา 23:59:59
			endOfDay := time.Date(promo.End_date.Year(), promo.End_date.Month(), promo.End_date.Day(), 23, 59, 59, 0, time.UTC)

			// ถ้าเวลาปัจจุบัน (currentDate) ผ่านไปแล้วถึงเวลา 23:59:59 ของวันที่หมดอายุ
			if currentDate.After(endOfDay) {
				// อัพเดทสถานะเป็นหมดอายุ (status = 3)
				db.Model(&entity.Promotion{}).
					Where("id = ? AND status_id != 4", promo.ID).
					Update("status_id", 3)
			}
		}
	}

	// อัพเดทสถานะเป็น 1 (ใช้งานได้) หากโปรโมชั่นยังไม่หมดอายุ
	db.Model(&entity.Promotion{}).
		Where("end_date >= ? AND status_id != 4", currentDate).
		Update("status_id", 1)

	// หากโปรโมชั่นถึงจำนวนจำกัด (limit) และสถานะยังเป็น 1 (ใช้งานได้) ก็อัพเดทเป็น 2 (หมดแล้ว)
	db.Model(&entity.Promotion{}).
		Where("`limit` = count_limit AND status_id = 1").
		Update("status_id", 2)

	c.JSON(http.StatusOK, promotions)
}






func Get(c *gin.Context) {


   ID := c.Param("id")

   var promotion entity.Promotion


   db := config.DB()
   results := db.First(&promotion, ID)

   if results.Error != nil {

       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

       return

   }

   if promotion.ID == 0 {

       c.JSON(http.StatusNoContent, gin.H{})

       return

   }

   c.JSON(http.StatusOK, promotion)


}


func Update(c *gin.Context) {


   var promotion entity.Promotion


   PromotionID := c.Param("id")


   db := config.DB()

   result := db.First(&promotion, PromotionID)

   if result.Error != nil {

       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})

       return

   }


   if err := c.ShouldBindJSON(&promotion); err != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})

       return

   }


   result = db.Save(&promotion)

   if result.Error != nil {

       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})

       return

   }


   c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})

}


func Delete(c *gin.Context) {


    id := c.Param("id")
 
    db := config.DB()
 
    if tx := db.Exec("DELETE FROM promotions WHERE id = ?", id); tx.RowsAffected == 0 {
 
        c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
 
        return
 
    }
 
    c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
 
 }
 