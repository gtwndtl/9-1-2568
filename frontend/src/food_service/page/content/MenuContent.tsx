
import MenuList from "../menu_list/MenuList";
import OrderList from "../order_list/OrderList";
import "./MenuContent.css";
import PromoButton from "../../../promotion/pages/promobutton/promobutton";
import ReviewTripShow from "../../../review/pages/reviewshow/trip/ReviewTripShow";
import ReviewFoodShow from "../../../review/pages/reviewshow/food/ReviewFoodShow";


interface MenuListProps {
  selectFoodCategory: string;
}

export default function MenuContent({ selectFoodCategory }: MenuListProps) {
  return (
    <section className="content" id="content">
      <h1>{selectFoodCategory} Menus</h1>
      <div className="menu-content">
        <MenuList selectFoodCategory={selectFoodCategory} />
        <OrderList />
      </div>
      <div className="promo-container">
        <PromoButton />
      </div>
      <div><ReviewFoodShow/></div>
      <div><ReviewTripShow/></div>
    </section>
  );
}
