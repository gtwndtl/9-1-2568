package discount_type


import (

   "net/http"


   "team03/se67/config"

   "team03/se67/entity"

   "github.com/gin-gonic/gin"

)


func GetAll(c *gin.Context) {


   db := config.DB()


   var Discount_types []entity.Discount_type

   db.Find(&Discount_types)


   c.JSON(http.StatusOK, &Discount_types)


}

func Get(c *gin.Context) {


   ID := c.Param("id")

   var Discount_type entity.Discount_type


   db := config.DB()
   results := db.First(&Discount_type, ID)

   if results.Error != nil {

       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

       return

   }

   if Discount_type.ID == 0 {

       c.JSON(http.StatusNoContent, gin.H{})

       return

   }

   c.JSON(http.StatusOK, Discount_type)


}