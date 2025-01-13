import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import TripCheckoutForm from "./TripCheckoutForm";
import LDSRing from "../../../components/third-party/LDSRing";
import "./TripStripeCheckout.css";


// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51QOxoF4QmAAjQ0QzsimUKy0RcgMxNPvfbmCm6OJurQzEGULD1u2OfTSGfdd0OwpEW0tzpdkQvmQSZKvbq9waUceD00PaT9sjdJ");

interface TripStripeCheckoutFormProps {
  total: number;
  VAT: number;
}

export default function TripStripeCheckout({total, VAT}:TripStripeCheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState("");
  // const [dpmCheckerLink, setDpmCheckerLink] = useState("");
  // const location = useLocation();
  // const { total, VAT } = location.state || {};
  // const { setFoodServicePaymentID, foodServicePaymentID } = useFoodServicePayment();



  useEffect(() => {
    // console.log("total", total)
      fetch("http://localhost:4242/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: "total", amount: Math.round(total * 100) }] }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            // setDpmCheckerLink(data.dpmCheckerLink);
          } else {
            console.error("Invalid response: clientSecret missing.");
          }
        })
        .catch((error) => {
          console.error("Error creating PaymentIntent:", error);
        });
  }, [total]);

  const appearance = {
    // theme: 'strip',
    variables: {
      colorPrimary: '#133e87',
      fontFamily: ' -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif ',
      fontLineHeight: '1.5',
      fontSizeBase: '16px',
      borderRadius: '4px',
      colorBackground: '#fff',
      accessibleColorOnColorPrimary: '#262626'
      
    },
    rules: {
      '.Block': {
        backgroundColor: 'var(--colorBackground)',
        boxShadow: 'none',
        padding: '10px'
      },
      '.Input': {
        padding: '12px'
      },
      '.Input:disabled, .Input--invalid:disabled': {
        color: 'lightgray'
      },
      '.Tab': {
        padding: '10px 12px 8px 12px',
        border: 'none'
      },
      '.Tab:hover': {
        border: 'none',
        boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
      },
      '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
        border: 'none',
        backgroundColor: '#fff',
        boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
      },
      '.Label': {
        fontWeight: '500',
        fontStyle: '18px'
      }
    }
  };

  // Enable the skeleton loader UI for optimal loading.
  const loader = 'auto';

  return (
    <>
    <div className="stripe-checkout">
      {clientSecret ? (
        <>
          <Elements options={{clientSecret, appearance, loader}} stripe={stripePromise}>
            <TripCheckoutForm VAT={VAT}/>
          </Elements>
        </>
      ) : (
        <LDSRing/>
      )}
    </div>
    </>
  );
}
