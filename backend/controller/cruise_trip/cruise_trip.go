package cruise_trip

import (
	"log"
	"net/http"

	"team03/se67/config"
	"team03/se67/entity"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAll(c *gin.Context) {


    db := config.DB()
 
 
    var cruisetrip []entity.CruiseTrip
 
    db.Find(&cruisetrip)
 
 
    c.JSON(http.StatusOK, &cruisetrip)
 
 
 }

// POST /cruisetrips
func CreateCruiseTrip(c *gin.Context) {
    var cruisetrip entity.CruiseTrip

    // Bind to cruisetrip variable
    if err := c.ShouldBindJSON(&cruisetrip); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if _, err := govalidator.ValidateStruct(cruisetrip); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    // Log incoming request data
    log.Printf("Received data: %+v\n", cruisetrip)

    db := config.DB()

    // Validate ship
    var ship entity.Ship
    db.First(&ship, cruisetrip.ShipID)
    if ship.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Ship not found"})
        return
    }

    // // Validate route
    var route entity.Routes
    db.First(&route, cruisetrip.RoutesID)
    if route.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
        return
    }

    // Validate admin
    var employee entity.Employees
    db.First(&employee, cruisetrip.EmployeesID)
    if employee.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
        return
    }

    // Create CruiseTrip
    pl := entity.CruiseTrip{
        CruiseTripName: cruisetrip.CruiseTripName,
        Deets:  cruisetrip.Deets,
        StartDate:  cruisetrip.StartDate,
        EndDate:  cruisetrip.EndDate,
        RoutesID:  cruisetrip.RoutesID,
        // Routes: route,
        PlanImg:  cruisetrip.PlanImg,
		PlanPrice: cruisetrip.PlanPrice,
        ParticNum: cruisetrip.ParticNum,
        ShipID:  cruisetrip.ShipID,
        // Ship:    ship,
        EmployeesID:  cruisetrip.EmployeesID,
        // Employees:    employee,
    }

    // Save to database
    if err := db.Create(&pl).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "Created success", "data": pl})
}


// GET /CruiseTrip/:id
func GetCruiseTrip(c *gin.Context) {
	ID := c.Param("id")
	var cruisetrip entity.CruiseTrip

	db := config.DB()
	results := db.Preload("Ship").Preload("Routes").Preload("Employees").First(&cruisetrip, ID)
	if results.Error != nil {
        if results.Error == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "CruiseTrip not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        }
        return
    }
	if cruisetrip.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}
	c.JSON(http.StatusOK, cruisetrip)
}

// GET /classes
func ListCruiseTrips(c *gin.Context) {

	var cruisetrips []entity.CruiseTrip

	db := config.DB()
	results := db.Preload("Ship").Preload("Routes").Preload("Employee").Find(&cruisetrips)
	if results.Error != nil {
        if results.Error == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "CruiseTrip not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        }
        return
    }
	c.JSON(http.StatusOK, cruisetrips)
}

// DELETE /cruisetrips/:id
func DeleteCruiseTrip(c *gin.Context) {

	id := c.Param("id")
	db := config.DB()
	if tx := db.Exec("DELETE FROM cruisetrips WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})

}

// PATCH /classes
func UpdateCruiseTrip(c *gin.Context) {
	var cruisetrip entity.CruiseTrip

	UserID := c.Param("id")

	db := config.DB()
	result := db.First(&cruisetrip, UserID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&cruisetrip); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

    if _, err := govalidator.ValidateStruct(cruisetrip); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result = db.Save(&cruisetrip)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}

// GET /CruiseTrips/count
func CountCruiseTrips(c *gin.Context) {
	var count int64
	db := config.DB()
	if err := db.Model(&entity.CruiseTrip{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}