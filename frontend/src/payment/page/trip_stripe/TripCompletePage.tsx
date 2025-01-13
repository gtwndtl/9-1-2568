import React, { useEffect, useState } from "react";
import {
  useStripe,
} from "@stripe/react-stripe-js";
import "./TripStripeCheckout.css";
// import { useOrder } from "../../../food_service/context/OrderContext";
// import { FoodServicePaymentInterface } from "../../interface/IFoodServicePayment";
// import { CreateFoodServicePayment } from "../../service/https/FoodServicePaymentAPI";
// import { message } from "antd";
// import { OrderInterface } from "../../../food_service/interface/IOrder";
// import { UpdateOrderById } from "../../../food_service/service/https/OrderAPI";
// import FoodReceipt from "../receipt/FoodReceipt";
import "./TripCompletePage.css"
import { TripPaymentInterface } from "../../interface/ITripPayment";
import { CreateTripPayment } from "../../service/https/TripPaymentAPI";
import { BookingCabinInterface } from "../../../booking_cabin/interface/IBookingCabin";
import { UpdateBookingCabinById } from "../../../booking_cabin/service/https/BookingCabinAPI";
import { message } from "antd";
import { BookingTripInterface } from "../../../booking_cabin/interface/IBookingTrip";
import { UpdateBookingTripById } from "../../../booking_cabin/service/https/BookingTripAPI";
import TripReceipt from "../receipt/TripReceipt";
import { CreatePromotionUsed, GetPromotionById, UpdatePromotionById } from "../../../promotion/service/htpps/PromotionAPI";
import { PromotionUsedInterface } from "../../../promotion/interface/Promotion_used";
// import { GetTripPaymentIDForFoodPayment } from "../payment/service/https/TripPaymentAPI";
// import { useLocation } from "react-router-dom";

const SuccessIcon =
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.4695 0.232963C15.8241 0.561287 15.8454 1.1149 15.5171 1.46949L6.14206 11.5945C5.97228 11.7778 5.73221 11.8799 5.48237 11.8748C5.23253 11.8698 4.99677 11.7582 4.83452 11.5681L0.459523 6.44311C0.145767 6.07557 0.18937 5.52327 0.556912 5.20951C0.924454 4.89575 1.47676 4.93936 1.79051 5.3069L5.52658 9.68343L14.233 0.280522C14.5613 -0.0740672 15.1149 -0.0953599 15.4695 0.232963Z" fill="white" />
  </svg>;

const ErrorIcon =
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.25628 1.25628C1.59799 0.914573 2.15201 0.914573 2.49372 1.25628L8 6.76256L13.5063 1.25628C13.848 0.914573 14.402 0.914573 14.7437 1.25628C15.0854 1.59799 15.0854 2.15201 14.7437 2.49372L9.23744 8L14.7437 13.5063C15.0854 13.848 15.0854 14.402 14.7437 14.7437C14.402 15.0854 13.848 15.0854 13.5063 14.7437L8 9.23744L2.49372 14.7437C2.15201 15.0854 1.59799 15.0854 1.25628 14.7437C0.914573 14.402 0.914573 13.848 1.25628 13.5063L6.76256 8L1.25628 2.49372C0.914573 2.15201 0.914573 1.59799 1.25628 1.25628Z" fill="white" />
  </svg>;

const InfoIcon =
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 1.5H4C2.61929 1.5 1.5 2.61929 1.5 4V10C1.5 11.3807 2.61929 12.5 4 12.5H10C11.3807 12.5 12.5 11.3807 12.5 10V4C12.5 2.61929 11.3807 1.5 10 1.5ZM4 0C1.79086 0 0 1.79086 0 4V10C0 12.2091 1.79086 14 4 14H10C12.2091 14 14 12.2091 14 10V4C14 1.79086 12.2091 0 10 0H4Z" fill="white" />
    <path fillRule="evenodd" clipRule="evenodd" d="M5.25 7C5.25 6.58579 5.58579 6.25 6 6.25H7.25C7.66421 6.25 8 6.58579 8 7V10.5C8 10.9142 7.66421 11.25 7.25 11.25C6.83579 11.25 6.5 10.9142 6.5 10.5V7.75H6C5.58579 7.75 5.25 7.41421 5.25 7Z" fill="white" />
    <path d="M5.75 4C5.75 3.31075 6.31075 2.75 7 2.75C7.68925 2.75 8.25 3.31075 8.25 4C8.25 4.68925 7.68925 5.25 7 5.25C6.31075 5.25 5.75 4.68925 5.75 4Z" fill="white" />
  </svg>;

const STATUS_CONTENT_MAP = {
  succeeded: {
    text: "Payment succeeded",
    iconColor: "#30B130",
    icon: SuccessIcon,
  },
  processing: {
    text: "Your payment is processing.",
    iconColor: "#6D6E78",
    icon: InfoIcon,
  },
  requires_payment_method: {
    text: "Your payment was not successful, please try again.",
    iconColor: "#DF1B41",
    icon: ErrorIcon,
  },
  default: {
    text: "Something went wrong, please try again.",
    iconColor: "#DF1B41",
    icon: ErrorIcon,
  }
};


// const stripePromise = loadStripe("pk_test_51QOxoF4QmAAjQ0QzsimUKy0RcgMxNPvfbmCm6OJurQzEGULD1u2OfTSGfdd0OwpEW0tzpdkQvmQSZKvbq9waUceD00PaT9sjdJ");

export default function TripCompletePage() {
  const stripe = useStripe();
  const [messageApi, contextHolder] = message.useMessage();
  // const { orderID, tripPayment } = useOrder();
  // const [ VAT, SetVAT ] = useState<number>(0);
  // const [ bookingCabinID, SetBookingCabinIDData ] = useState<number>(0);
  // const [ bookingTripID, SetBookingTripIDData ] = useState<number>(0);
  const [tripPayment, setTripPayment] = useState<TripPaymentInterface>()

  // const [ loading, setLoading] = useState<boolean>(false) 
  // const navigate = useNavigate();\
  // const location = useLocation();
  // const { VAT } = location.state || {};



  const [status, setStatus] = useState<string>("processing");
  const [intentId, setIntentId] = useState(String);
  const [, setAmount] = useState(Number);

  // console.log("tripPayment", tripPayment)
  // console.log("localStorage.getItem(TripPaymentID)", localStorage.getItem("TripPaymentID"))

  // if (!tripPayment && !localStorage.getItem("TripPaymentID")) {
  //   console.log("in not")
  // }

  // useEffect(() => {

  // },[]);

  useEffect(() => {
    const VATData = localStorage.getItem("VATTrip");
    const BookingCabinIDData = localStorage.getItem("BookingCabinID");
    const BookingTripIDData = localStorage.getItem("BookingTripID");

    if (VATData && BookingCabinIDData && BookingTripIDData) {
      const parsedVATData = JSON.parse(VATData);
      const parsedBookingCabinIDData = JSON.parse(BookingCabinIDData);
      const parsedBookingTripIDData = JSON.parse(BookingCabinIDData);
      // SetVAT(parsedVATData)
      // SetBookingCabinIDData(parsedBookingCabinIDData)
      // SetBookingTripIDData(parsedBookingTripIDData)
      if (!stripe) return;

      const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
      if (!clientSecret) return;

      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) return;

        setStatus(paymentIntent.status);
        setIntentId(paymentIntent.id);
        setAmount(paymentIntent.amount / 100);

        // ป้องกันการสร้างข้อมูลซ้ำ
        const hasAlreadyProcessed = localStorage.getItem(`processed_${paymentIntent.id}`);
        if (hasAlreadyProcessed) {
          if (!localStorage.getItem("TripPaymentID")) {
            setStatus("default")
          }
          console.log("Payment already processed, skipping...");
          return;
        }

        if (paymentIntent.payment_method) {
          fetch(`http://localhost:4242/get-payment-method?id=${paymentIntent.payment_method}`)
            .then((response) => response.json())
            .then((data) => {
              if (paymentIntent.status === "succeeded" && parsedBookingCabinIDData && parsedBookingTripIDData && (!tripPayment && !localStorage.getItem("TripPaymentID"))) {
                funcCreateTripPayment(paymentIntent.amount / 100, paymentIntent.status, data.type, parsedBookingCabinIDData, parsedBookingTripIDData, parsedVATData);

                // บันทึกว่า payment นี้ถูกประมวลผลแล้ว
                localStorage.setItem(`processed_${paymentIntent.id}`, "true");
              }
            })
            .catch((error) => console.error("Error retrieving payment method:", error));
        }
      });
    }

  }, [stripe, intentId, tripPayment]);

  const promoTripData = JSON.parse(localStorage.getItem("promoTripData") || "{}");
  const promotionTripId = promoTripData.promotionTripId || null;
  const discountTripAmount = promoTripData.discountTripAmount || 0;
  const customerID = Number(localStorage.getItem("id"));

  const funcCreateTripPayment = async (price: number, status: string, methodType: string, booking_cabin_id: number, booking_trip_id: number, vat: number) => {
    // setLoading(true)

    const tripPaymentData: TripPaymentInterface = {
      PaymentDate: new Date(),
      TotalPrice: price - discountTripAmount,
      VAT: vat,
      PaymentStatus: status,
      PaymentMethod: methodType,
      BookingCabinID: booking_cabin_id,
      PromotionID: promotionTripId || 0,
    };

    const resTrip = await CreateTripPayment(tripPaymentData);
    if (resTrip.status === 201) {
      setTripPayment(resTrip.data)
      // update booking cabin 
      const updateBookingCabinData: BookingCabinInterface = {
        BookingStatus: "Paid",
      };

      // console.log("resTrip", resTrip)

      const resBookingCabin = await UpdateBookingCabinById(booking_cabin_id, updateBookingCabinData);
      if (resBookingCabin.status === 200) {
        // update booking trip
        const updateBookingTripData: BookingTripInterface = {
          BookingStatus: "Paid",
        }

        const resBookingTrip = await UpdateBookingTripById(booking_trip_id, updateBookingTripData);
        if (resBookingTrip.status === 200) {
          // messageApi.open({
          //   type: "success",
          //   content: "update Booking Trip success",
          // });
          message.success("success to create payment.");
          // setLoading(false)
          localStorage.setItem("TripPaymentID", resTrip.data.ID)
        } else {
          messageApi.open({
            type: "error",
            content: resBookingTrip.data.error,
          });
          return;
        }
        // localStorage.setItem("foodServicePaymentID", JSON.stringify(resBookingCabin.data.ID));

      } else {
        messageApi.open({
          type: "error",
          content: resBookingCabin.data.error,
        });
        return;
      }
      const TripPaymentID = resTrip.data.ID;
      localStorage.setItem("TripPaymentID", TripPaymentID.toString());

      if (promotionTripId) {
        await handlePromotionTripUpdate(promotionTripId, TripPaymentID);
      }
    } else {
      messageApi.open({
        type: "error",
        content: resTrip.data.error,
      });
      return;
    }
  };

  const handlePromotionTripUpdate = async (promotionTripId: string, TripPaymentID: number) => {
    const promotionTripResponse = await GetPromotionById(promotionTripId);
    if (promotionTripResponse.status !== 200) {
      message.error("Failed to retrieve promotion details.");
      return;
    }

    const updatedCountLimit = promotionTripResponse.data.count_limit + 1;
    const payload = { count_limit: updatedCountLimit };
    const resPromotionUpdate = await UpdatePromotionById(promotionTripId, payload);
    if (resPromotionUpdate.status !== 200) {
      message.error("Failed to update promotion.");
      return;
    }

    const formattedTripValues: PromotionUsedInterface = {
      promotion_id: promotionTripId,
      customer_id: customerID,
      trip_payment_id: TripPaymentID,
    };
    const resPromotionTripUsed = await CreatePromotionUsed(formattedTripValues);
    if (resPromotionTripUsed.status !== 201) {
      message.error("Failed to create PromotionUsed.");
      return;
    }
  };

  const handleClickBack = async () => {
    localStorage.removeItem("TripPaymentID")
    localStorage.removeItem("BookingCabinID")
    localStorage.removeItem("BookingTripID")
    localStorage.removeItem("VATTrip")

    // ลบ processed_{paymentIntent.id}
    const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
    if (clientSecret) {
      const paymentIntentId = clientSecret.split("_secret")[0]; // ดึง paymentIntent.id จาก clientSecret
      localStorage.removeItem(`processed_${paymentIntentId}`);
    }

    location.href = "/trip-summary"
  }

  return (
    <div className="payment-status-container" >
      {contextHolder}
      <div id="payment-status" >
        <div id="status-icon" style={{ backgroundColor: STATUS_CONTENT_MAP[status].iconColor }} >
          {STATUS_CONTENT_MAP[status].icon}
        </div>
        <h2 id="status-text">{STATUS_CONTENT_MAP[status].text}</h2>
        {intentId && status == "succeeded" &&
          <div id="details-table" >
            <TripReceipt />
          </div>
        }
        <a id="retry-button" onClick={() => handleClickBack()}>BACK TO HOME</a>
      </div>
    </div>
  );
}