
import './LandingPage.css';
import ReviewTripShow from '../review/pages/reviewshow/trip/ReviewTripShow';
import NavbarLandingPage from './navbar/NavbarLandingPage';
import Home from './home/home';

const LandingPage = () => {
  return (
    <div className="landing-page">
        <NavbarLandingPage/>
        <div className='home'><Home/></div>
        <div className='review-trip-show'><ReviewTripShow/></div>
    </div>
  );
};

export default LandingPage;
