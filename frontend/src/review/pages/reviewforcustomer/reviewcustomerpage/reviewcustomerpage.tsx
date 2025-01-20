import UserInfo from "../userinfo/userinfo";
// import Navbar from '../../../../adminpage/navbar';
import './reviewcustomerpage.css';
import NavBarReview from "../navbarreview/navbarreview";
import { useEffect, useState } from "react";
import Loader from "../../../../components/third-party/Loader";

export default function ReviewForCustomerPage() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const simulateLoading = setTimeout(() => {
      setIsLoading(false); // Stop loading after 3 seconds
    }, 500);

    return () => clearTimeout(simulateLoading); // Cleanup timeout
  }, []);

  return (
    <section className="reviewforcustomercontent" id="reviewforcustomercontent">
      {/* <div><Navbar /></div> */}
      {isLoading ? (
        <div className="spinner-review-container">
          <Loader />
        </div>
      ) : (
        <>
          <div className="left-content">
            <UserInfo />
            <div className="right-content">
              <NavBarReview />
            </div>
          </div>
        </>
      )
      }
    </section >
  );
}