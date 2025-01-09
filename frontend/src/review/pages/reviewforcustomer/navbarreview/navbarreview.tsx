import { useState } from "react";
import "./navbarreview.css";
import FoodReviewedPage from "../reviewpage/reviewed/foodreviewpage/foodreviewedpage";
import NotReviewedFoodPage from "../reviewpage/not_review/not_reviewfoodpage/not_reviewfoodpage";

export default function NavBarReview() {
  const [selectedPage, setSelectedPage] = useState<
    "FoodReviewed" | "TripReviewed" | "FoodNotReviewed" | "TripNotReviewed"
  >("FoodReviewed");

  return (
    <section className="navbar-review" id="navbar-review">
      <div className="navbar-table">
        {/* Reviewed Dropdown */}
        <div className="dropdown">
          <button
            className={`main-button ${
              selectedPage.includes("Reviewed") ? "active" : ""
            }`}
          >
            Reviewed
          </button>
          <div className="dropdown-content">
            <button
              className="dropdown-button"
              onClick={() => setSelectedPage("FoodReviewed")}
            >
              Food
            </button>
            <button
              className="dropdown-button"
              onClick={() => setSelectedPage("TripReviewed")}
            >
              Trip
            </button>
          </div>
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
          <div className="dropdown-content">
            <button
              className="dropdown-button"
              onClick={() => setSelectedPage("FoodNotReviewed")}
            >
              Food
            </button>
            <button
              className="dropdown-button"
              onClick={() => setSelectedPage("TripNotReviewed")}
            >
              Trip
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Rendering for Pages */}
      <div className="page-content">
        {selectedPage === "FoodReviewed" && <FoodReviewedPage />}
        {selectedPage === "TripReviewed" && <div>Trip Reviewed Page</div>}
        {selectedPage === "FoodNotReviewed" && <NotReviewedFoodPage />}
        {selectedPage === "TripNotReviewed" && <div>Trip Not Reviewed Page</div>}
      </div>
    </section>
  );
}
