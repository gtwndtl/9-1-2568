package config

import (
	"fmt"
	"time"

	"team03/se67/entity"
)


func SetupPromotionDatabase() {


   db.AutoMigrate(

       &entity.Promotion{},

       &entity.Discount_type{},

       &entity.Promotion_type{},

       &entity.Promotion_status{},

       &entity.Promotion_Used{},
   )


   PromotionTrip_CabinType := entity.Promotion_type{Type: "Trip and Cabin"}

   PromotionFoodType := entity.Promotion_type{Type: "Food"}


   db.FirstOrCreate(&PromotionTrip_CabinType, &entity.Promotion_type{Type: "Trip and Cabin"})

   db.FirstOrCreate(&PromotionFoodType, &entity.Promotion_type{Type: "Food"})


   DiscountRate := entity.Discount_type{Discount_type: "เปอร์เซ็นต์"}

   DiscountAmount := entity.Discount_type{Discount_type: "จำนวนเงิน"}


   db.FirstOrCreate(&DiscountRate, &entity.Discount_type{Discount_type: "เปอร์เซ็นต์"})

   db.FirstOrCreate(&DiscountAmount, &entity.Discount_type{Discount_type: "จำนวนเงิน"})


   StatusActive := entity.Promotion_status{Status: "ใช้งาน"}

   StatusFull := entity.Promotion_status{Status: "เต็ม"}
   
   StatusExpired := entity.Promotion_status{Status: "หมดอายุ"}

   StatusCanceled := entity.Promotion_status{Status: "ยกเลิก"}


   db.FirstOrCreate(&StatusActive, &entity.Promotion_status{Status: "ใช้งาน"})

   db.FirstOrCreate(&StatusFull, &entity.Promotion_status{Status: "เต็ม"})

   db.FirstOrCreate(&StatusExpired, &entity.Promotion_status{Status: "หมดอายุ"})

   db.FirstOrCreate(&StatusCanceled, &entity.Promotion_status{Status: "ยกเลิก"})


   samplePromotions := []entity.Promotion{
    {
        Name:          "No Promotion",
        Details:       "No Promotion",
    },
    {
        Name:          "10% Discount on Food",
        Details:       "Get 10% off on food orders!",
        Code:          "FOOD10",
        Start_date:    time.Now(),
        End_date:      time.Now().AddDate(0, 1, 0),
        Discount:      10.0,
        Minimum_price: 100.0,
        Limit:         100,
        Count_Limit:   1,
        Limit_discount: 50.0,
        DiscountID:    1,  // Percentage discount
        TypeID:        2,  // Food type
        StatusID:      1,  // Active status
    },
    {
        Name:          "50 Baht Off on Meal Over 200",
        Details:       "Get 50 Baht off on food orders over 200 Baht!",
        Code:          "FOOD50",
        Start_date:    time.Now(),
        End_date:      time.Now().AddDate(0, 1, 0),
        Discount:      50.0,
        Minimum_price: 200.0,
        Limit:         250,
        Count_Limit:   0,
        Limit_discount:0,
        DiscountID:    2,  // Amount discount
        TypeID:        2,  // Food type
        StatusID:      1,  // Active status
    },
    {
        Name:          "100 Baht Off on Meal Over 500",
        Details:       "Get 100 Baht off when you spend more than 500 Baht on food!",
        Code:          "SPN50",
        Start_date:    time.Now(),
        End_date:      time.Now().AddDate(0, 1, 0),
        Discount:      100.0,
        Minimum_price: 500.0,
        Limit:         150,
        Count_Limit:   0,
        Limit_discount:0,
        DiscountID:    2,  // Amount discount
        TypeID:        2,  // Food type
        StatusID:      1,  // Active status
    },
    {
        Name:          "380 Baht Off on Meal Over 3500",
        Details:       "Get 380 Baht off when you spend more than 3500 Baht on food!",
        Code:          "SPN35",
        Start_date:    time.Now(),
        End_date:      time.Now().AddDate(0, 1, 0),
        Discount:      100.0,
        Minimum_price: 500.0,
        Limit:         150,
        Count_Limit:   0,
        Limit_discount:0,
        DiscountID:    2,  // Amount discount
        TypeID:        2,  // Food type
        StatusID:      1,  // Active status
    },
    {
        Name:          "5% Off on All Orders Above 100",
        Details:       "Get 5% off on all food orders over 100 Baht!",
        Code:          "FOOD5",
        Start_date:    time.Now(),
        End_date:      time.Now().AddDate(0, 1, 0),
        Discount:      5.0,
        Minimum_price: 100.0,
        Limit:         1000,
        Count_Limit:   0,
        Limit_discount: 50.0,
        DiscountID:    1,  // Percentage discount
        TypeID:        2,  // Food type
        StatusID:      1,  // Active status
    },
}

// Insert each promotion into the database
for _, promo := range samplePromotions {
    db.FirstOrCreate(&promo, entity.Promotion{Code: promo.Code})
}

promotionUsed := &entity.Promotion_Used{
    PromotionID:       2,
    CustomerID:        1,
    FoodServicePaymentID: 1,
}
db.FirstOrCreate(promotionUsed)

fmt.Println("Sample promotions have been added to the database.")
}