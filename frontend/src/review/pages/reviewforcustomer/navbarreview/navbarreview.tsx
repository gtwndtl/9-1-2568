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
          <div className="dropdown">
            <button className={`btn ${selectedPage.includes("Reviewed") ? "active" : ""
              }`}
            >
              <ul className="dropdown-menu">
                <li onClick={() => setSelectedPage("FoodReviewed")}>Food</li>
                <li onClick={() => setSelectedPage("TripReviewed")}>Trip</li>
              </ul>
              <span className="icon">
                <svg viewBox="0 0 175 80" width="40" height="40">
                  <rect width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="30" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="60" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                </svg>
              </span>
              <span className="text">Reviewed</span>
            </button>
          </div>

          <div className="dropdown">
            <button className={`btn ${selectedPage.includes("Reviewed") ? "active" : ""
              }`}
            >
              <ul className="dropdown-menu">
                <li onClick={() => setSelectedPage("FoodNotReviewed")}>Food</li>
                <li onClick={() => setSelectedPage("TripNotReviewed")}>Trip</li>
              </ul>
              <span className="icon">
                <svg viewBox="0 0 175 80" width="40" height="40">
                  <rect width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="30" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                  <rect y="60" width="80" height="15" fill="#f0f0f0" rx="10"></rect>
                </svg>
              </span>
              <span className="text">Unreviewed</span>
            </button>
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
