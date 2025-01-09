export interface ReviewInterface {
  [x: string]: any;

  review_type_id: number;

  order_id: number;

  ID?: number;

  review_text?: string;

  review_date?: Date;

  minimum_price?: number;

  service_rating?: number;

  price_rating?: number;

  taste_rating?: number;

  overall_rating?: number;

  recommended_dishes?: string;

  reviewTypeID?: number;

  FoodServicePaymentID?: number;

  CustomerID?: number;

  pictures?: string[]; // เปลี่ยนเป็น Array เพื่อรองรับหลายรูปภาพ

}