package config

import (
	"fmt"
	"team03/se67/entity"
	"time"
)

func SetupReviewDatabase() {

	db.AutoMigrate(

		&entity.Review{},

		&entity.Review_type{},
	)

	ReviewTripType := entity.Review_type{Review_Type: "Trip and Cabin"}

	ReviewFoodType := entity.Review_type{Review_Type: "Food"}

	db.FirstOrCreate(&ReviewTripType, &entity.Review_type{Review_Type: "Trip and Cabin"})

	db.FirstOrCreate(&ReviewFoodType, &entity.Review_type{Review_Type: "Food"})

	firstReview := entity.Review{
		Review_date:            time.Now(),
		Review_text:            "I had the pleasure of enjoying both a refreshing glass of orange juice and a perfectly cooked steak, and it was an amazing combination. The orange juice was fresh, tangy, and well-balanced, offering a natural sweetness that was invigorating. It paired wonderfully with the rich and flavorful steak, which was cooked to perfection with a beautiful sear and tender inside. The steak had just the right amount of seasoning, enhancing the natural taste without overwhelming it. Together, these two made for a deliciously satisfying meal that was both refreshing and hearty. Highly recommended!",
		Service_rating:         5,
		Value_for_money_rating: 4.5,
		Taste_rating:           4,
		Overall_rating:         4.5,
		Recommended_dishes:     "Steak",
		ReviewTypeID:           2,
		OrderID:                1,
		FoodServicePaymentID:   1,
		CustomerID:             1,
	}
	db.FirstOrCreate(&firstReview)

	fmt.Println("Review have been added to the database.")
}
