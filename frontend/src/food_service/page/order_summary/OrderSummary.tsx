import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import "./OrderSummary.css";
import { GetPromotions, GetPromotionUsed } from "../../../promotion/service/htpps/PromotionAPI";

const OrderSummary: React.FC<{ subtotal: number }> = ({ subtotal }) => {
  const { filteredOrderDetails, formatPriceWithTwoDecimals } = useOrder(); // Access Context
  const [promoCode, setPromoCode] = useState(""); // State to handle promo code input
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null); // State to handle discounted total
  const [promotions, setPromotions] = useState<any[]>([]); // State to store fetched promotions
  const [promoError, setPromoError] = useState<string>(""); // State to handle error messages
  const [promotionId, setPromotionId] = useState<number | null>(null); // State to store selected promotion ID

  const vatRate = 0.07; // 7% VAT
  const numericSubtotal = Number(subtotal) || 0;
  const vat = numericSubtotal * vatRate;
  const customerID = localStorage.getItem("id");

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseCode = e.target.value.toUpperCase(); // Convert to uppercase
    setPromoCode(uppercaseCode);
    setPromoError(""); // Clear error when user types

    // Update promotionId in real-time based on promo code
    const matchedPromotion = promotions.find((p) => p.code === uppercaseCode);
    if (matchedPromotion) {
      setPromotionId(matchedPromotion.ID);
    } else {
      setPromotionId(null); // Reset promotionId if no match
      localStorage.removeItem('promoData');
      localStorage.removeItem('promotionId');
      localStorage.removeItem('discountAmount');
    }
  };

  const recalculateTotal = (promotion: any) => {
    let newDiscountedTotal = numericSubtotal + vat;

    // Apply discount
    if (promotion.discount_id === 1) {
      // Percentage discount
      newDiscountedTotal -= (promotion.discount / 100) * newDiscountedTotal;
    } else if (promotion.discount_id === 2) {
      // Fixed amount discount
      newDiscountedTotal -= promotion.discount;
    }

    // Check limit_discount for percentage discount (DiscountID = 1)
    if (promotion.discount_id === 1 && promotion.limit_discount) {
      newDiscountedTotal = Math.max(
        newDiscountedTotal,
        numericSubtotal + vat - promotion.limit_discount
      );
    }

    // Check if discount exceeds the total
    if (newDiscountedTotal < 0) {
      setPromoError("The discount cannot exceed the total amount.");
      return;
    }

    setDiscountedTotal(newDiscountedTotal);

    // Save both discountAmount and promotionId to localStorage
    const discountAmount = numericSubtotal + vat - newDiscountedTotal;
    localStorage.setItem(
      "promoData",
      JSON.stringify({ discountAmount: discountAmount.toFixed(2), promotionId: promotion.ID })
    );
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode) {
      setPromoError("Please enter a promo code.");
      // รีเซ็ทข้อมูลหลังจากแสดงข้อความข้อผิดพลาด
      resetPromoData();
      return;
    }
  
    const promotion = promotions.find((p) => p.code === promoCode);
    if (!promotion) {
      setPromoError("Invalid promo code.");
      // รีเซ็ทข้อมูลหลังจากแสดงข้อความข้อผิดพลาด
      resetPromoData();
      return;
    }
  
    // รีเซ็ทข้อมูลหากพบโปรโมชั่น แต่ไม่สามารถใช้งานได้
    if (promotion.type_id !== 2) {
      setPromoError("This promotion is not applicable.");
      resetPromoData();
      return;
    }
  
    if (promotion.status_id !== 1) {
      setPromoError("This promotion is no longer active.");
      resetPromoData();
      return;
    }
  
    if (numericSubtotal + vat < promotion.minimum_price) {
      setPromoError(`Minimum order amount is ฿ ${promotion.minimum_price}`);
      resetPromoData();
      return;
    }
  
    const res = await GetPromotionUsed();
    if (res.status === 200) {
      const usedPromotion = res.data.find(
        (promo: any) =>
          promo.promotion_id === Number(promotionId) && promo.customer_id === Number(customerID)
      );
  
      if (usedPromotion) {
        setPromoError("Promotion code can only be used once.");
        resetPromoData();
        return;
      }
    } else {
      setPromoError("Failed to load used promotions.");
      resetPromoData();
      return;
    }
  
    // กำหนด promotionId และคำนวณส่วนลด
    setPromotionId(promotion.ID);
    localStorage.setItem("promoData", JSON.stringify({ promotionId: promotion.ID }));
  
    recalculateTotal(promotion); // Recalculate the total based on the promotion
    setPromoError(""); // Reset any errors
  };
  
  // ฟังก์ชันที่จะรีเซ็ทข้อมูล promotion
  const resetPromoData = () => {
    localStorage.removeItem('promoData');
    localStorage.removeItem('promotionId');
    localStorage.removeItem('discountAmount');
    setPromoCode(""); // Clear the promo code input
    setDiscountedTotal(null); // Reset discounted total
  };
  

  const total = discountedTotal !== null ? discountedTotal : numericSubtotal + vat;

  // Refetch promotions whenever filteredOrderDetails or promoCode changes
  useEffect(() => {
    const fetchPromotions = async () => {
      const res = await GetPromotions();
      if (res.status === 200) {
        setPromotions(res.data);
      } else {
        setPromoError("Failed to load promotions.");
      }
    };
    fetchPromotions();
  }, [filteredOrderDetails, promoCode]); // Add both dependencies

  useEffect(() => {
    // Reset promo code if order details change
    if (filteredOrderDetails.length > 0) {
      setPromoCode(""); // Reset promo code input
      setPromoError(""); // Reset any promo errors
      setDiscountedTotal(null); // Reset discounted total
      localStorage.removeItem('promoData');
      localStorage.removeItem('promotionId');
      localStorage.removeItem('discountAmount');
    }
  }, [filteredOrderDetails]);

  return (
    <>
      <aside className="order-summary-container">
        <section className="order-summary-promotion-container">
          <header>
            <h1>Discount</h1>
          </header>
          <div className="promotion">
            <p>Promotion code</p>
            <div className="promotion-content">
              <input
                type="text"
                value={promoCode}
                onChange={handlePromoCodeChange}
                placeholder="Enter promo code"
              />
              <button onClick={handleApplyPromoCode}>Apply</button>
              </div>
          {promoError && <p className="error-message">{promoError}</p>}
        </div>
        </section>
        <section className="order-summary">
          <header>
            <h1>Order Summary</h1>
          </header>
          <div className="order-summary-content">
            <div className="order-summary-detail">
              <div className="order-summary-subtotal">
                <p>Subtotal</p>
                <p>฿ {formatPriceWithTwoDecimals(numericSubtotal.toFixed(2))}</p>
              </div>
              <div className="order-summary-vat">
                <p>VAT (7%)</p>
                <p>฿ {formatPriceWithTwoDecimals(vat.toFixed(2))}</p>
              </div>
              <div className="order-summary-promotion">
                <p>Promotion</p>
                <p>฿ - {discountedTotal !== null ? formatPriceWithTwoDecimals((numericSubtotal + vat - discountedTotal).toFixed(2)) : "0.00"}</p>
              </div>
            </div>
          </div>
        </section>
        <hr />
        <section className="order-summary-footer">
          <div className="order-summary-total">
            <h2>Total</h2>
            <h2>฿ {formatPriceWithTwoDecimals(total.toFixed(2))}</h2>
          </div>
          <Link to={ "/food-service/login/menu/order-summary/checkout"} state={{total: total, VAT: vat}}>
            <button 
              className={`checkout-button${filteredOrderDetails.length > 0 ? "" : " disabled"}`} 
              disabled={filteredOrderDetails.length === 0}
            >
              Confirm Order
            </button>
          </Link>
        </section>
      </aside>
    </>
  );
};

export default OrderSummary;