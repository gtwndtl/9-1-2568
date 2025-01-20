package unit

import (
	"testing"
	"time"

	"team03/se67/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestReviewDate(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`ReviewDate is required`, func(t *testing.T) {

		review := entity.Review{
			Review_text:            "A",
			Service_rating:         5.0,
			Value_for_money_rating: 5.0,
			Taste_rating:           5.0,
			Overall_rating:         5.0,
			Pictures:               []string{},
			Recommended_dishes:     "A",
			ReviewTypeID:           1,
			OrderID:                1,
			FoodServicePaymentID:   1,
			CustomerID:             1,
		}

		ok, err := govalidator.ValidateStruct(review)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ReviewDate is required"))
	})
}

func TestReviewText(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`ReviewText is required`, func(t *testing.T) {

		reviewDate, _ := time.Parse("2006-01-02", "2024-01-01")

		review := entity.Review{
			Review_date:            reviewDate,
			Review_text:            "",
			Service_rating:         5.0,
			Value_for_money_rating: 5.0,
			Taste_rating:           5.0,
			Overall_rating:         5.0,
			Pictures:               []string{},
			Recommended_dishes:     "A",
			ReviewTypeID:           1,
			OrderID:                1,
			FoodServicePaymentID:   1,
			CustomerID:             1,
		}

		ok, err := govalidator.ValidateStruct(review)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ReviewText is required"))
	})
}

func TestReviewRecommendedDishes(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`RecommendedDishes is required`, func(t *testing.T) {

		reviewDate, _ := time.Parse("2006-01-02", "2024-01-01")

		review := entity.Review{
			Review_date:            reviewDate,
			Review_text:            "A",
			Service_rating:         5.0,
			Value_for_money_rating: 5.0,
			Taste_rating:           5.0,
			Overall_rating:         5.0,
			Pictures:               []string{},
			Recommended_dishes:     "",
			ReviewTypeID:           1,
			OrderID:                1,
			FoodServicePaymentID:   1,
			CustomerID:             1,
		}

		ok, err := govalidator.ValidateStruct(review)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RecommendedDishes is required"))
	})
}

func TestReviewTypeID(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`ReviewTypeID is required`, func(t *testing.T) {

		reviewDate, _ := time.Parse("2006-01-02", "2024-01-01")

		review := entity.Review{
			Review_date:            reviewDate,
			Review_text:            "A",
			Service_rating:         5.0,
			Value_for_money_rating: 5.0,
			Taste_rating:           5.0,
			Overall_rating:         5.0,
			Pictures:               []string{},
			Recommended_dishes:     "A",
			OrderID:                1,
			FoodServicePaymentID:   1,
			CustomerID:             1,
		}

		ok, err := govalidator.ValidateStruct(review)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ReviewTypeID is required"))
	})
}

func TestValidReview(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Valid Review`, func(t *testing.T) {

		reviewDate, _ := time.Parse("2006-01-02", "2024-01-01")

		review := entity.Review{
			Review_date:            reviewDate,
			Review_text:            "A",
			Service_rating:         5.0,
			Value_for_money_rating: 5.0,
			Taste_rating:           5.0,
			Overall_rating:         5.0,
			Pictures:               []string{},
			Recommended_dishes:     "A",
			ReviewTypeID:           1,
			OrderID:                1,
			FoodServicePaymentID:   1,
			CustomerID:             1,
		}

		ok, err := govalidator.ValidateStruct(review)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
