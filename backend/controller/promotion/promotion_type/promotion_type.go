package promotion_type


import (

   "net/http"


   "team03/se67/config"

   "team03/se67/entity"

   "github.com/gin-gonic/gin"

)


func GetAll(c *gin.Context) {


   db := config.DB()


   var types []entity.Promotion_type

   db.Find(&types)


   c.JSON(http.StatusOK, &types)


}

func Get(c *gin.Context) {


   ID := c.Param("id")

   var Type entity.Promotion_type


   db := config.DB()
   results := db.First(&Type, ID)

   if results.Error != nil {

       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

       return

   }

   if Type.ID == 0 {

       c.JSON(http.StatusNoContent, gin.H{})

       return

   }

   c.JSON(http.StatusOK, Type)


}