import { OrderInterface } from "../../food_service/interface/IOrder";
import { PromotionInterface } from "../../promotion/interface/Promotion";
import { TripPaymentInterface } from "./ITripPayment";

export interface FoodServicePaymentInterface {
  ID?: number;
  PaymentDate?: Date;
  Price?: number;
  VAT?: number;
  PaymentStatus?: string;
  PaymentMethod?: string;

  OrderID?: number;
  Order?: OrderInterface;
  
  TripPaymentID?: number;
  TripPayment?: TripPaymentInterface;

  PromotionID: number;
  Promotion?: PromotionInterface;
}