package unit

import (
	"team03/se67/entity"
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestValidPromotionUsed(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`Valid Promotion Used`, func(t *testing.T) {
		promotionUsed := entity.Promotion_Used{
			PromotionID:          1,
			CustomerID:           1,
			FoodServicePaymentID: 1,
			TripPaymentID:        1,
		}
		ok, err := govalidator.ValidateStruct(promotionUsed)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestPromotionUsedPromotionID(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`PromotionID is required`, func(t *testing.T) {
		promotionUsed := entity.Promotion_Used{
			CustomerID:           1,
			FoodServicePaymentID: 1,
			TripPaymentID:        1,
		}
		ok, err := govalidator.ValidateStruct(promotionUsed)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PromotionID is required"))
	})
}

func TestPromotionUsedCustomerID(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`CustomerID is required`, func(t *testing.T) {
		promotionUsed := entity.Promotion_Used{
			PromotionID:          1,
			FoodServicePaymentID: 1,
			TripPaymentID:        1,
		}
		ok, err := govalidator.ValidateStruct(promotionUsed)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("CustomerID is required"))
	})
}

func TestPromotionUsedFoodServicePaymentID(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`FoodServicePaymentID is required`, func(t *testing.T) {
		promotionUsed := entity.Promotion_Used{
			PromotionID:   1,
			CustomerID:    1,
			TripPaymentID: 1,
		}
		ok, err := govalidator.ValidateStruct(promotionUsed)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FoodServicePaymentID is required"))
	})
}

func TestPromotionUsedTripPaymentID(t *testing.T) {
	g := NewGomegaWithT(t)
	t.Run(`TripPaymentID is required`, func(t *testing.T) {
		promotionUsed := entity.Promotion_Used{
			PromotionID:          1,
			CustomerID:           1,
			FoodServicePaymentID: 1,
		}
		ok, err := govalidator.ValidateStruct(promotionUsed)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TripPaymentID is required"))
	})
}
