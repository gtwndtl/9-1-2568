import { useState } from "react";
import "./navbarreview.css";
import FoodReviewedPage from "../reviewpage/reviewed/foodreviewpage/foodreviewedpage";
import NotReviewedFoodPage from "../reviewpage/not_review/not_reviewfoodpage/not_reviewfoodpage";
import NotReviewedTripPage from "../reviewpage/not_review/not_reviewtrippage/not_reviewtrippage";
import TripReviewedPage from "../reviewpage/reviewed/tripreviewpage/tripreviewpage";

export default function NavBarReview() {
  const [selectedPage, setSelectedPage] = useState<
    "FoodReviewed" | "TripReviewed" | "FoodNotReviewed" | "TripNotReviewed"
  >("FoodReviewed");

  return (
    
    <section className="navbar-review" id="navbar-review">
      <div className="navbar-table">
        <div className="dropdown-container">
          {/* Reviewed Dropdown */}
          <div className="dropdown">
            <button
              className={`main-button ${
                selectedPage.includes("Reviewed") ? "active" : ""
              }`}
            >
              Reviewed
            </button>
            <ul className="dropdown-menu">
              <li onClick={() => setSelectedPage("FoodReviewed")}>Food</li>
              <li onClick={() => setSelectedPage("TripReviewed")}>Trip</li>
            </ul>
          </div>

          {/* Not Reviewed Dropdown */}
          <div className="dropdown">
            <button
              className={`main-button ${
                selectedPage.includes("NotReviewed") ? "active" : ""
              }`}
            >
              Not Reviewed
            </button>
            <ul className="dropdown-menu">
              <li onClick={() => setSelectedPage("FoodNotReviewed")}>Food</li>
              <li onClick={() => setSelectedPage("TripNotReviewed")}>Trip</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Conditional Rendering for Pages */}
      <div className="page-content">
        {selectedPage === "FoodReviewed" && <FoodReviewedPage />}
        {selectedPage === "TripReviewed" && <TripReviewedPage />}
        {selectedPage === "FoodNotReviewed" && <NotReviewedFoodPage />}
        {selectedPage === "TripNotReviewed" && <NotReviewedTripPage />}
      </div>
    </section>
  );
}
