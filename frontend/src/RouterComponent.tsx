import React, { lazy, StrictMode } from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { OrderProvider } from "./food_service/context/OrderContext";

import Loadable from "./components/third-party/Loadable";
// import Loader from "./components/third-party/Loader";
// import LDSRing from "./components/third-party/LDSRing";
import SignInPages from "./authentication/Login";
import DotLoader from "./components/third-party/DotLoader";
import ReviewForCustomerPage from "./review/pages/reviewforcustomer/reviewcustomerpage/reviewcustomerpage";
import PromotionTripPage from "./promotion/pages/promotion/promotripcodepage/promotripcode";
import PromotionFoodPage from "./promotion/pages/promotion/promofoodcodepage/promofoodcode";
import AllReviewsFood from "./review/pages/reviews/food/allreviewsfood";
import Promotion from "./promotion/pages/promotionadmin";
import PromotionCreate from "./promotion/pages/promotionadmin/create";
import PromotionEdit from "./promotion/pages/promotionadmin/edit";
import NavbarAdmin from "./adminpage/navbar";
import AllReviewsTrip from "./review/pages/reviews/trip/allreviewstrip";
import LandingPage from "./landingpage/LandingPage";

// import TripCompletePage from "./payment/page/trip_stripe/TripCompletePage";
// import TripSummary from "./payment/page/trip_summary/TripSummary";

// const SignInPages = Loadable(lazy(() => import("./authentication/Login")));

// Food Service
const SignUpPages = Loadable(lazy(() => import("./authentication/Register")));
const NavbarFoodService = Loadable(lazy(() => import("./food_service/page/navbar/NavbarFoodService")));
const Menu = Loadable(lazy(() => import("./food_service/page/menu/Menu")));
const MenuDetail = Loadable(lazy(() => import("./food_service/page/menu_detail/MenuDetail")));
const OrderSummary = Loadable(lazy(() => import("./food_service/page/order_item/OrderItem")));

// Payment
const FoodStripeCheckout = Loadable(lazy(() => import("./payment/page/food_stripe/FoodStripeCheckout")));
const FoodCompletePage = Loadable(lazy(() => import("./payment/page/food_stripe/FoodCompletePage")));
const TripSummary = Loadable(lazy(() => import("./payment/page/trip_summary/TripSummary")));
const TripCompletePage = Loadable(lazy(() => import("./payment/page/trip_stripe/TripCompletePage")));

const stripePromise = loadStripe("pk_test_51QOxoF4QmAAjQ0QzsimUKy0RcgMxNPvfbmCm6OJurQzEGULD1u2OfTSGfdd0OwpEW0tzpdkQvmQSZKvbq9waUceD00PaT9sjdJ");

const RouterComponent: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <><Link to={"/home"}>Home Landing Page</Link><br />
          <Link to={"/food-service/login"}>to food service</Link><br />
          <Link to={"/trip-summary"}>trip</Link><br />
          <Link to={"/admin"}>Admin</Link><br />
          <Link to={"/customer/review"}>Review Customer</Link><br />
          <Link to={"/promotion/trip"}>Promotion Trip</Link><br />
          <Link to={"/promotion/food"}>Promotion Food</Link><br />
          <Link to={"/reviews/trip"}>All Trip Review</Link><br />
          <Link to={"/reviews/food-service"}>All Food Review</Link><br />
        </>
      ),
    },
    {
      path: "/home",
      element: <LandingPage />,
    },
    {
      path: "/food-service/login",
      element: <SignInPages />,
    },
    {
      path: "/food-service/signup",
      element: <SignUpPages />,
    },
    {
      path:"/admin",
      element: <NavbarAdmin/>,
    },
    {
      path: "/loader",
      element: <DotLoader />,
    },
    {
      path: "/food-service/login/menu",
      element: <OrderProvider><NavbarFoodService /></OrderProvider>,
      children: [
        {
          path: "order",
          element: <Menu />,
        },
        {
          path: "menu-detail",
          element: <MenuDetail />,
        },
        {
          path: "order-summary",
          element: <OrderSummary />,
        },
        {
          path: "order-summary/checkout",
          element: (    
              <FoodStripeCheckout />
          ),
        },
      ],
    },
    {
      path: "/food-service/login/menu/order-summary/checkout/complete",
      element: (
        <OrderProvider>
        <Elements stripe={stripePromise}>
              <FoodCompletePage />
          </Elements>
        </OrderProvider>
      ),
    },
    {
      path: "/trip-summary",
      element: <TripSummary/>,
    },
    {
      path: "trip-summary/complete",
      element: (
        <OrderProvider>
        <Elements stripe={stripePromise}>
              <TripCompletePage />
          </Elements>
        </OrderProvider>
      ),
    },
    {
      path: "/promotion/trip",
      element: <PromotionTripPage />,
    },
    {
      path: "/promotion/food",
      element: <OrderProvider><NavbarFoodService /></OrderProvider>,
      children: [

        {

          path: "/promotion/food",

          element: <PromotionFoodPage />,

        },
      ]
    },
    {
      path: "/customer/review",
      element: <ReviewForCustomerPage />,
    },
    {
      path: "/reviews/trip",
      element: <AllReviewsTrip />,
    },
    {
      path: "/reviews/food-service",
      element: <OrderProvider><NavbarFoodService /></OrderProvider>,
      children: [

        {

          path: "/reviews/food-service",

          element: <AllReviewsFood />,

        },
      ]
    },
    {

      path: "/admin/promotion",
      // element: <Navbar />,
      children: [

        {

          path: "/admin/promotion",

          element: <Promotion />,

        },

        {

          path: "/admin/promotion/create",

          element: <PromotionCreate />,

        },

        {

          path: "/admin/promotion/edit/:id",

          element: <PromotionEdit />,

        },

      ],

    },
  ]);

  return (
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
  );
};

export default RouterComponent;
