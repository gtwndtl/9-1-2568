import UserInfo from "../userinfo/userinfo";
import Navbar from '../../../../navbaradmin/navbar';
import './reviewcustomerpage.css';
import NavBarReview from "../navbarreview/navbarreview";

export default function ReviewForCustomerPage() {
  return (
    <section className="reviewforcustomercontent" id="reviewforcustomercontent">
      <div><Navbar /></div>
      <div className="left-content">
        <UserInfo />
        <div className="right-content">
          <NavBarReview />
        </div>
      </div>
    </section>
  );
}
