package unit

import (
	"testing"
	"time"

	"team03/se67/entity"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestCode(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Code is required`, func(t *testing.T) {

		// แปลง string เป็น time.Time
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "ลด 30% ขั้นต่ำ 150 บาทสำหรับอาหารทุกรายการ",
			Code:           "", // ผิดตรงนี้
			Start_date:     startDate,
			End_date:       endDate,
			Discount:       30,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// ตรวจสอบด้วย govalidator
		ok, err := govalidator.ValidateStruct(promotion)

		// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
		g.Expect(ok).NotTo(BeTrue())
		// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
		g.Expect(err).NotTo(BeNil())

		// err.Error ต้องมี error message แสดงออกมา
		g.Expect(err.Error()).To(Equal("Code is required"))
	})
}

func TestDetails(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Details is required`, func(t *testing.T) {

		// แปลง string เป็น time.Time
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Discount:       30,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// ตรวจสอบด้วย govalidator
		ok, err := govalidator.ValidateStruct(promotion)

		// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
		g.Expect(ok).NotTo(BeTrue())
		// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
		g.Expect(err).NotTo(BeNil())

		// err.Error ต้องมี error message แสดงออกมา
		g.Expect(err.Error()).To(Equal("Details is required"))
	})
}

func TestStart_Date(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Start_date is required`, func(t *testing.T) {

		// แปลง string เป็น time.Time
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "ABC",
			Code:           "ABC",
			End_date:       endDate,
			Discount:       30,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// ตรวจสอบด้วย govalidator
		ok, err := govalidator.ValidateStruct(promotion)

		// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
		g.Expect(ok).NotTo(BeTrue())
		// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
		g.Expect(err).NotTo(BeNil())

		// err.Error ต้องมี error message แสดงออกมา
		g.Expect(err.Error()).To(Equal("Start_date is required"))
	})
}

func TestEnd_Date(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`End_date is required`, func(t *testing.T) {

		// แปลง string เป็น time.Time
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "ABC",
			Code:           "ABC",
			Start_date:     startDate,
			Discount:       30,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// ตรวจสอบด้วย govalidator
		ok, err := govalidator.ValidateStruct(promotion)

		// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
		g.Expect(ok).NotTo(BeTrue())
		// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
		g.Expect(err).NotTo(BeNil())

		// err.Error ต้องมี error message แสดงออกมา
		g.Expect(err.Error()).To(Equal("End_date is required"))
	})
}

func TestDiscount(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Discount is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Discount is required"))
	})

}

func TestMinimum_price(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Minimum_price is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Discount:       30,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		// Validation should fail because Minimum_price is missing
		g.Expect(ok).NotTo(BeTrue())
		// An error should be captured
		g.Expect(err).NotTo(BeNil())
		// Error message should indicate that Minimum_price is required
		g.Expect(err.Error()).To(Equal("Minimum_price is required"))
	})

}

func TestLimit(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Limit is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Limit is required"))
	})

}

func TestCount_Limit(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Count_Limit is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Limit:          50,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Count_Limit is required"))
	})

}

func TestLimit_discount(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Limit_discount is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:          "ลด 30 %",
			Details:       "AAA",
			Code:          "ABC",
			Start_date:    startDate,
			End_date:      endDate,
			Minimum_price: 150,
			Discount:      30,
			Count_Limit:   12,
			Limit:         50,
			DiscountID:    1,
			TypeID:        1,
			StatusID:      1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Limit_discount is required"))
	})

}

func TestDiscountID(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`Discount ID is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			TypeID:         1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Discount ID is required"))
	})

	t.Run(`Valid DiscountID`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			DiscountID:     1, // Valid DiscountID
			TypeID:         1,
			StatusID:       1,
		}

		// Validate the promotion
		ok, err := govalidator.ValidateStruct(promotion)

		// Validation should pass
		g.Expect(ok).To(BeTrue())
		// No error should occur
		g.Expect(err).To(BeNil())
	})
}

func TestTypeID(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`TypeID is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			DiscountID:     1,
			StatusID:       1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TypeID is required"))
	})

	t.Run(`Valid TypeID`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// Validate the promotion
		ok, err := govalidator.ValidateStruct(promotion)

		// Validation should pass
		g.Expect(ok).To(BeTrue())
		// No error should occur
		g.Expect(err).To(BeNil())
	})
}

func TestStatusID(t *testing.T) {

	g := NewGomegaWithT(t)

	t.Run(`StatusID is required`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			DiscountID:     1,
			TypeID:         1,
		}

		ok, err := govalidator.ValidateStruct(promotion)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("StatusID is required"))
	})

	t.Run(`Valid StatusID`, func(t *testing.T) {
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "AAA",
			Code:           "ABC",
			Start_date:     startDate,
			End_date:       endDate,
			Minimum_price:  150,
			Discount:       30,
			Count_Limit:    12,
			Limit:          50,
			Limit_discount: 2,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// Validate the promotion
		ok, err := govalidator.ValidateStruct(promotion)

		// Validation should pass
		g.Expect(ok).To(BeTrue())
		// No error should occur
		g.Expect(err).To(BeNil())
	})
}

func TestValid(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run(`valid`, func(t *testing.T) {
		// แปลง string เป็น time.Time
		startDate, _ := time.Parse("2006-01-02", "2024-01-01")
		endDate, _ := time.Parse("2006-01-02", "2024-01-31")

		promotion := entity.Promotion{
			Name:           "ลด 30 %",
			Details:        "ลด 30% ขั้นต่ำ 150 บาทสำหรับอาหารทุกรายการ",
			Code:           "DS30",
			Start_date:     startDate,
			End_date:       endDate,
			Discount:       30,
			Minimum_price:  150,
			Limit:          50,
			Count_Limit:    1,
			Limit_discount: 599,
			DiscountID:     1,
			TypeID:         1,
			StatusID:       1,
		}

		// ตรวจสอบด้วย govalidator
		ok, err := govalidator.ValidateStruct(promotion)

		// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
		g.Expect(ok).To(BeTrue())
		// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
		g.Expect(err).To(BeNil())
	})
}
