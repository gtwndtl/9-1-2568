import React from "react";
import MenuList from "../menu_list/MenuList";
import OrderList from "../order_list/OrderList";
import "./MenuContent.css";
import PromoButton from "../../../promotion/pages/promobutton/promobutton";
import ReviewShow from "../../../review/pages/reviewshow/ReviewShow";

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
      <div><ReviewShow/></div>
    </section>
  );
}
