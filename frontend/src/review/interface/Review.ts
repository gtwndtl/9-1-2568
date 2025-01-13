export interface ReviewInterface {
  [x: string]: any;

  ID?: number;

  review_text?: string;

  review_date?: Date;

  minimum_price?: number;

  service_rating?: number;

  value_for_money_rating?: number;

  taste_rating?: number;

  overall_rating?: number;

  recommended_dishes?: string;

  reviewTypeID?: number;

  FoodServicePaymentID?: number;

  BookingTripID?: number,

  TripPaymentID?: number;

  CustomerID?: number;

  pictures?: string[]; // เปลี่ยนเป็น Array เพื่อรองรับหลายรูปภาพ

}