export interface PromotionInterface {
    [x: string]: any;

    ID?: number;
  
    Name?: string;
  
    Details?: string;
  
    Code?: string;
  
    Start_date?: Date;
  
    End_date?: Date;
  
    Discount?: number;

    Minimum_price?: number;

    Limit?: number;

    Count_limit?: number;

    Limit_discount?: number;

    DiscountID?: number;

    TypeID?: number;

    StatusID?: number;
  
  }