import React, { useEffect, useState } from "react";
import { BookingCabinInterface } from "../../../booking_cabin/interface/IBookingCabin";
import { message } from "antd";
import { GetBookingCabinById } from "../../../booking_cabin/service/https/BookingCabinAPI";
// import { AiOutlineUser } from "react-icons/ai";
// import StripeCheckout from '../trip_stripe/StripeCheckout';
import "./TripSummary.css";
import TripStripeCheckout from "../trip_stripe/TripStripeCheckout";
// import { CabinInterface } from "../../../booking_cabin/interface/ICabin";
import { GetCabinTypeById } from "../../../booking_cabin/service/https/CabinTypeAPI";
import { CabinTypeInterface } from "../../../booking_cabin/interface/ICabinType";
import { GetCruiseTripById } from "../../../booking_cabin/service/https/CruiseTripAPI";
import { CruiseTripInterface } from "../../../booking_cabin/interface/ICruiseTrip";
import { GetUsersById } from "../../../services/https";
import { CustomerInterface } from "../../../interfaces/ICustomer";
import { GetPromotions, GetPromotionUsed } from "../../../promotion/service/htpps/PromotionAPI";

// function getTextColor(backgroundColor: string): string {
//   const rgb = backgroundColor.match(/\d+/g)?.map(Number);
//   if (!rgb || rgb.length < 3) return "black"; // fallback
//   const [r, g, b] = rgb;
//   const brightness = (r * 299 + g * 587 + b * 114) / 1000;
//   return brightness > 125 ? "black" : "white";
// }

export default function TripSummary() {
  const [bookingCabin, setBookingCabin] = useState<BookingCabinInterface>();
  const [cabinType, setCabinType] = useState<CabinTypeInterface>();
  const [cruiseTrip, setCruiseTrip] = useState<CruiseTripInterface>();
  const [customer, setCustomer] = useState<CustomerInterface>();
  const [VAT, setVAT] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);


  const [messageApi, contextHolder] = message.useMessage();

  //////////////Promotion//////////////

  const [subtotal, setSubtotal] = useState<number>(0);
  const [promoTripCode, setPromoTripCode] = useState(""); // State to handle promo code input
  const [discountedTripTotal, setDiscountedTripTotal] = useState<number | null>(null); // State to handle discounted total
  const [promotionsTrip, setPromotionsTrip] = useState<any[]>([]); // State to store fetched promotions
  const [promoTripError, setPromoTripError] = useState<string>(""); // State to handle error messages
  const [promotionTripId, setPromotionTripId] = useState<number | null>(null); // State to store selected promotion ID
  const customerID = localStorage.getItem("id");

  //////////////Promotion//////////////

  // console.log("bookingCabin", bookingCabin);
  // console.log("cabinType", cabinType);
  // console.log("cruiseTrip", cruiseTrip);
  // console.log("customer", customer);

  const calculateVATAndTotal = () => {
    const subtotal = bookingCabin?.TotalPrice ?? 0;
    const vat = subtotal * 0.07;
    const totalPrice = subtotal + vat;

    setSubtotal(subtotal)
    setVAT(vat);
    setTotal(totalPrice);
  };

  function formatDate(date: Date | string | undefined): string {
    if (!date) return "N/A"; // fallback if date is undefined
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      // timeZoneName: "short",
    }).format(parsedDate);
  }

  const formatPriceWithTwoDecimals = (price: number | string | undefined): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    }).format(Number(price ?? 0));
  };


  const getBookingCabin = async () => {
    const res = await GetBookingCabinById(1);
    if (res.status === 200) {
      setBookingCabin(res.data);

      getCruiseTrip(res.data.BookingTrip.CruiseTripID);
      getCabinType(res.data.Cabin.CabinTypeID);
      getCustomer(res.data.BookingTrip.CustomerID);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getCruiseTrip = async (cruise_tip_id: number) => {
    const res = await GetCruiseTripById(cruise_tip_id);
    if (res.status === 200) {
      setCruiseTrip(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getCabinType = async (cabin_type_id: number) => {
    const res = await GetCabinTypeById(cabin_type_id);
    if (res.status === 200) {
      setCabinType(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getCustomer = async (customer_id: number) => {
    const res = await GetUsersById(customer_id);
    if (res.status === 200) {
      setCustomer(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  useEffect(() => {
    getBookingCabin();
  }, []);

  useEffect(() => {
    if (bookingCabin) {
      calculateVATAndTotal();
    }
  }, [bookingCabin]);

  //////////////Promotion//////////////

  const handlePromoTripCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uppercaseCode = e.target.value.toUpperCase(); // Convert to uppercase
    setPromoTripCode(uppercaseCode);
    setPromoTripError(""); // Clear any error messages
    const totalPrice = subtotal + VAT;
    // Reset discount data when code changes
    setDiscountedTripTotal(null);
    setPromotionTripId(null);
    setTotal(totalPrice);
    localStorage.removeItem("promoTripData");
    localStorage.removeItem("promotionTripId");
    localStorage.removeItem("discountTripAmount");
    // Update promotion ID if code matches a valid promotion
    const matchedPromotion = promotionsTrip.find((p) => p.code === uppercaseCode);
    if (matchedPromotion) {
      setPromotionTripId(matchedPromotion.ID);
    }
  };
  const handleApplyPromoTripCode = async () => {
    resetPromoTripData();
    if (!promoTripCode) {
      setPromoTripError("Please enter a promo code.");
      resetPromoTripData();
      return;
    }
    const promotionTrip = promotionsTrip.find((p) => p.code === promoTripCode);
    if (!promotionTrip) {
      setPromoTripError("Invalid promo code.");
      resetPromoTripData();
      return;
    }
    // ตรวจสอบว่าโปรโมชั่นใช้งานได้หรือไม่
    if (promotionTrip.type_id !== 1) {
      setPromoTripError("This promotion is not applicable.");
      resetPromoTripData();
      return;
    }
    if (promotionTrip.status_id !== 1) {
      setPromoTripError("This promotion is no longer active.");
      resetPromoTripData();
      return;
    }
    if (subtotal + VAT < promotionTrip.minimum_price) {
      setPromoTripError(`Minimum trip amount is ฿ ${promotionTrip.minimum_price}`);
      resetPromoTripData();
      return;
    }
    const res = await GetPromotionUsed();
    if (res.status === 200) {
      const usedPromotionTrip = res.data.find(
        (promo: any) =>
          promo.promotion_id === Number(promotionTripId) && promo.customer_id === Number(customerID)
      );
      if (usedPromotionTrip) {
        setPromoTripError("Promotion code can only be used once.");
        resetPromoTripData();
        return;
      }
    } else {
      setPromoTripError("Failed to load used promotions.");
      resetPromoTripData();
      return;
    }
    // คำนวณส่วนลดและอัปเดต total ทันที
    setPromotionTripId(promotionTrip.ID);
    localStorage.setItem("promoTripData", JSON.stringify({ promotionTripId: promotionTrip.ID }));
    // Save both discountAmount and promotionId to localStorage
    const newDiscountedTotal = subtotal + VAT - calculateDiscount(promotionTrip);
    setDiscountedTripTotal(newDiscountedTotal);
    setTotal(newDiscountedTotal); // อัปเดต total ทันที
    const discountTripAmount = subtotal + VAT - newDiscountedTotal
    localStorage.setItem("promoTripData", JSON.stringify({ discountTripAmount: discountTripAmount.toFixed(2), promotionTripId: promotionTrip.ID })
    );
    setPromoTripError(""); // ล้างข้อผิดพลาด
  };
  // ฟังก์ชันคำนวณส่วนลด
  const calculateDiscount = (promotion: any): number => {
    let discount = 0;

    if (promotion.discount_id === 1) {
      // Percentage discount
      discount = (promotion.discount / 100) * (subtotal + VAT);
      if (promotion.limit_discount) {
        discount = Math.min(discount, promotion.limit_discount);
      }
    } else if (promotion.discount_id === 2) {
      // Fixed discount
      discount = promotion.discount;
    }

    // Ensure discount does not exceed the total price (subtotal + VAT)
    discount = Math.min(discount, subtotal + VAT);

    return discount;
  };

  // ฟังก์ชันที่จะรีเซ็ทข้อมูล promotion
  const resetPromoTripData = () => {
    localStorage.removeItem('promoTripData');
    localStorage.removeItem('promotionTripId');
    localStorage.removeItem('discountTripAmount');
    setPromoTripCode(""); // Clear the promo code input
    setDiscountedTripTotal(null); // Reset discounted total
  };
  // Refetch promotions whenever filteredOrderDetails or promoCode changes
  useEffect(() => {
    const fetchPromotionsTrip = async () => {
      const res = await GetPromotions();
      if (res.status === 200) {
        setPromotionsTrip(res.data);
      } else {
        setPromoTripError("Failed to load promotions.");
      }
    };
    fetchPromotionsTrip();
  }, [promoTripCode]); // Add both dependencies

  //////////////Promotion//////////////

  return (
    <>
      {contextHolder}
      <section className="trip-summary-container">
        <div className="trip-summary-grid">
          <div className="cruise-trip">
            <div className="trip-info">
              <header className="header">
                <h1>Trip Detail</h1>
              </header>
              <div className="detail">
                <div className="img-container">
                  <img
                    src="https://ik.imgkit.net/3vlqs5axxjf/external/ik-seo/http://images.ntmllc.com/v4/cruise-ship/CAN/CAN016/CAN016_EXT_Arvia_ZD3F6B/Arvia-Exterior.jpg?tr=w-780%2Ch-437%2Cfo-auto"
                    alt={cruiseTrip?.CruiseTripName}
                  />
                </div>
                <div className="info">
                  <h1 className="ship-name">{cruiseTrip?.Ship?.Name} Ship</h1>
                  <p><strong>Trip:</strong> {cruiseTrip?.CruiseTripName}</p>
                  <p><strong>Duration:</strong> {cruiseTrip?.ParticNum} Night</p>

                  <div className="route">
                    <div className="modal-body">
                      <div className="progress-track">
                        <ul id="progressbar">
                          <li className="departure-left" id="departure">
                            <p>{formatDate(cruiseTrip?.StartDate)}</p>
                          </li>
                          <li className="arrival-right" id="arrival">
                            <p>{formatDate(cruiseTrip?.EndDate)}</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <div className="cabin-info">
              <header>
                <h1 className="header">Cabin Detail</h1>
              </header>
              <div className="detail">
                <div className="cabin-img-container">
                  <img
                    src={cabinType?.Image}
                    alt={cabinType?.TypeName}
                  />
                </div>
                <span>
                  <p><strong>Cabin Type:</strong> {cabinType?.TypeName}</p>
                  <p><strong>Number:</strong> {bookingCabin?.Cabin?.CabinNumber}</p>
                  <p><strong>Cabin Size:</strong> {cabinType?.Cabinsize}</p>
                  <p><strong>Note:</strong> {bookingCabin?.Note}</p>
                </span>
              </div>
            </div>
            <hr />
            <div className="customer-info">
              <header>
                <h1 className="header">Contract Details</h1>
              </header>
              <span>
                <p><strong>Email:</strong> {customer?.email}</p>
                <p><strong>Name:</strong> {customer?.first_name} {customer?.last_name}</p>
                <p><strong>Phone:</strong> {customer?.phone ? customer?.phone : "-"}</p>
                <p><strong>Address:</strong> {customer?.Address ? customer?.Address : "-"}</p>
              </span>
            </div>
            <hr />
            <div className="checkout">
              <header>
                <h1 className="header">Select Payment Method</h1>
              </header>
              <TripStripeCheckout total={total} VAT={VAT} />
            </div>
          </div>
        </div>

        <aside className="trip-summary">
          <div className="inside">
            <header>
              <h1 className="header">Discount</h1>
            </header>
            <div className="promotion">
              <p>Promotion code</p>
              <div className="promotion-content">
                <input
                  type="text"
                  value={promoTripCode}
                  onChange={handlePromoTripCodeChange}
                  placeholder="Enter promo code"
                />
                <button onClick={handleApplyPromoTripCode}>Apply</button>
              </div>
              {promoTripError && <p className="error-message">{promoTripError}</p>}
            </div>
            <hr />
            <header>
              <h1 className="header">Summary</h1>
            </header>
            <div className="detail">
              <span>
                <p>Cruise Trip</p>
                <p>฿ {formatPriceWithTwoDecimals(cruiseTrip?.PlanPrice)}</p>
              </span>
              <span>
                <p>Cabin Price</p>
                <p>฿ {formatPriceWithTwoDecimals(cabinType?.CabinPrice)}</p>
              </span>
              {/* <hr /> */}
              <span>
                <p>Subtotal</p>
                <p>฿ {formatPriceWithTwoDecimals(bookingCabin?.TotalPrice)}</p>
              </span>
              <span>
                <p>VAT (7%)</p>
                <p>฿ {formatPriceWithTwoDecimals(VAT)}</p>
              </span>
              <span>
                <p>Promotion</p>
                <p>฿ - {discountedTripTotal !== null ? formatPriceWithTwoDecimals((subtotal + VAT - discountedTripTotal).toFixed(2)) : "0.00"}</p>
              </span>
              <span className="total">
                <h1>Total</h1>
                <h1 className="price">฿ {formatPriceWithTwoDecimals(total)}</h1>
              </span>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
