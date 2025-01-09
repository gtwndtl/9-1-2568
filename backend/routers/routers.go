package routers

import (
	"net/http"
	"team03/se67/controller/booking_cabin"
	"team03/se67/controller/booking_trip"
	"team03/se67/controller/cruise_trip"
	"team03/se67/controller/customers"
	"team03/se67/controller/food_service"
	"team03/se67/controller/genders"
	"team03/se67/controller/payment"
	"team03/se67/controller/promotion/discount_type"
	"team03/se67/controller/promotion/promotion"
	"team03/se67/controller/promotion/promotion_status"
	"team03/se67/controller/promotion/promotion_type"
	"team03/se67/controller/promotion/promotion_used"
	"team03/se67/controller/review/review"
	"team03/se67/controller/review/review_type"

	"team03/se67/middlewares"

	"github.com/gin-gonic/gin"
)

const PORT = "8000"

// SetupRouter initializes the router
func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// Public Routes
	setupAuthRoutes(r)

	// Private Routes (Require Authorization)
	private := r.Group("/")
	private.Use(middlewares.Authorizes())
	
	setupPromotionRoutes(private)
	setupReviewRoutes(private)
	setupUserRoutes(private)
	setupPaymentRoutes(private)
	setupFoodServiceRoutes(private)
	setupBookingCabinRoutes(private)
	setupBookingTripRoutes(private)
	setupCruiseTripRoutes(private)

	// Public Route for Genders
	r.GET("/genders", genders.GetAll)

	// Root Route
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	return r
}

// Function to setup Authentication routes
func setupAuthRoutes(r *gin.Engine) {
	r.POST("/signup", customers.SignUp)
	r.POST("/signin", customers.SignIn)
}

// Function to setup User routes
func setupUserRoutes(r *gin.RouterGroup) {
	r.PUT("/user/:id", customers.Update)
	r.GET("/users", customers.GetAll)
	r.GET("/user/:id", customers.Get)
	r.DELETE("/user/:id", customers.Delete)
}

// Function to setup Payment routes
func setupPaymentRoutes(r *gin.RouterGroup) {
	r.GET("/food-service-payments", payment.GetAllFoodServicePayments)
	r.GET("/food-service-payment/:id", payment.GetFoodServicePayment)
	r.POST("/food-service-payment", payment.CreateFoodServicePayment)
	r.PUT("/food-service-payment/:id", payment.UpdateFoodServicePayment)
	r.DELETE("/food-service-payment/:id", payment.DeleteFoodServicePayment)

	r.GET("/trip-payments", payment.GetAllTripPayments)
	r.GET("/trip-payment/:id", payment.GetTripPayment)
	r.POST("/trip-payment", payment.CreateTripPayment)
	r.PUT("/trip-payment/:id", payment.UpdateTripPayment)
	r.DELETE("/trip-payment/:id", payment.DeleteTripPayment)

	r.GET("/trip-paymentID-for-food-payment/:id", payment.GetTripPaymentIDForFoodPayment)
}

// Function to setup Food Service routes
func setupFoodServiceRoutes(r *gin.RouterGroup) {
	r.GET("/food-categories", food_service.GetAllFoodCategories)
	r.GET("/food-category/:id", food_service.GetFoodCategory)
	r.POST("/food-category", food_service.CreateFoodCategory)
	r.PUT("/food-category/:id", food_service.UpdateFoodCategory)
	r.DELETE("/food-category/:id", food_service.DeleteFoodCategory)

	r.GET("/menus", food_service.GetAllMenus)
	r.GET("/menu/:id", food_service.GetMenu)
	r.POST("/menu", food_service.CreateMenu)
	r.PUT("/menu/:id", food_service.UpdateMenu)
	r.DELETE("/menu/:id", food_service.DeleteMenu)

	r.GET("/order-detail-menu-options", food_service.GetAllOrderDetailMenuOptions)
	r.GET("/order-detail-menu-option/:id", food_service.GetOrderDetailMenuOption)
	r.POST("/order-detail-menu-option", food_service.CreateOrderDetailMenuOption)
	r.PUT("/order-detail-menu-option/:id", food_service.UpdateOrderDetailMenuOption)
	r.DELETE("/order-detail-menu-option/:id", food_service.DeleteOrderDetailMenuOption)

	r.GET("/order-details", food_service.GetAllOrderDetails)
	r.GET("/order-detail/:id", food_service.GetOrderDetail)
	r.POST("/order-detail", food_service.CreateOrderDetail)
	r.PUT("/order-detail/:id", food_service.UpdateOrderDetail)
	r.DELETE("/order-detail/:id", food_service.DeleteOrderDetail)

	r.GET("/orders", food_service.GetAllOrders)
	r.GET("/order/:id", food_service.GetOrder)
	r.POST("/order", food_service.CreateOrder)
	r.PUT("/order/:id", food_service.UpdateOrder)
	r.DELETE("/order/:id", food_service.DeleteOrder)

	
	r.GET("/menu-item-options", food_service.GetAllMenuItemOptions)
	r.GET("/menu-item-option/:id", food_service.GetMenuItemOption)
	r.POST("/menu-item-option", food_service.CreateMenuItemOption)
	r.DELETE("/menu-item-option/:id", food_service.DeleteMenuItemOption)
	
	r.GET("/menu-options", food_service.GetAllMenuOptions)
	r.POST("/menu-options", food_service.CreateMenuOption)
	r.PUT("/menu-options/:id", food_service.UpdateMenuOption)

	r.GET("/orders/pending/:id", food_service.GetPendingOrderByCustomerID)
	r.POST("/add-item-to-order", food_service.AddItemToOrder)
}

// Function to setup Booking Cabin routes
func setupBookingCabinRoutes(r *gin.RouterGroup) {
	r.GET("/booking-cabins", booking_cabin.ListBookingCabins)
	r.GET("/booking-cabin/:id", booking_cabin.GetBookingCabinByID)
	r.POST("/booking-cabin", booking_cabin.CreateBookingCabin)
	r.PUT("/booking-cabin/:id", booking_cabin.UpdateBookingCabinByID)

	r.GET("/cabin-types", booking_cabin.ListCabinTypes)
	r.GET("/cabin-type/:id", booking_cabin.GetCabinTypeByID)
}

// Function to setup Booking Trip routes
func setupBookingTripRoutes(r *gin.RouterGroup) {
	r.GET("/booking-trips", booking_trip.ListBookingTrips)
	r.GET("/booking-trip/:id", booking_trip.GetBookingTripByID)
	r.POST("/booking-trip", booking_trip.CreateBookingTrip)
	r.PUT("/booking-trip/:id", booking_trip.UpdateBookingTripByID)
}

// Function to setup Booking Trip routes
func setupCruiseTripRoutes(r *gin.RouterGroup) {
	r.GET("/cruise-trips", cruise_trip.ListCruiseTrips)
	r.GET("/cruise-trip/:id", cruise_trip.GetCruiseTrip)
	// r.POST("/cruise-trip", cruise_trip.CreateBookingTrip)
	// r.PUT("/cruise-trip/:id", cruise_trip.UpdateBookingTripByID)
}


// Function to setup Promotion
func setupPromotionRoutes(r *gin.RouterGroup) {
	//Promotion
	r.POST("/promotion", promotion.AddPromotion)
	r.PUT("/promotion/:id", promotion.Update)
	r.GET("/promotions", promotion.GetAll)
	r.GET("/promotion/:id", promotion.Get)
	r.DELETE("/promotion/:id", promotion.Delete)

	//PromotionUsed
	r.POST("/used", promotion_used.AddPromotionUsed)
	r.PUT("/used/:id", promotion_used.Update)
	r.GET("/useds", promotion_used.GetAll)
	r.GET("/used/:id", promotion_used.Get)
	r.DELETE("/used/:id", promotion_used.Delete)

	//PromotionType
	r.GET("/types", promotion_type.GetAll)
	r.GET("/type/:id", promotion_type.Get)

	//PromotionStatus
	r.GET("/status", promotion_status.GetAll)

	//DiscountType
	r.GET("/discount_type", discount_type.GetAll)
	r.GET("/discount_type/:id", discount_type.Get)

}


// Function to setup Booking Trip routes
func setupReviewRoutes(r *gin.RouterGroup) {
	//Review
	r.POST("/review", review.AddReview)
	r.PUT("/review/:id", review.Update)
	r.GET("/reviews", review.GetAll)
	r.GET("/review/:id", review.Get)
	r.DELETE("/review/:id", review.Delete)


	//ReviewType
	r.GET("/reviewtypes", review_type.GetAll)
	r.GET("/reviewtype/:id", review_type.Get)
}
