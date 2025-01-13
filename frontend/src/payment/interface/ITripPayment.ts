import { BookingCabinInterface } from "../../booking_cabin/interface/IBookingCabin";
import { PromotionInterface } from "../../promotion/interface/Promotion";

export interface TripPaymentInterface {
    ID?: number;
    PaymentDate?: Date;
    TotalPrice?: number;
    VAT?: number;
    Status?: string;
    PaymentStatus?: string;
    PaymentMethod?: string;

    BookingCabinID?: number;
    BookingCabin?: BookingCabinInterface;

    PromotionID: number;
    Promotion?: PromotionInterface;
}