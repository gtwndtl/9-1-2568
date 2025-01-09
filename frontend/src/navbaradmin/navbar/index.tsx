import React, { useState } from "react";
import { Layout, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import cruise_ship_logo from "../../assets/cruise_ship_logo.jpg";
import "./index.css";

const NavbarAdmin: React.FC = () => {
  const [active, setActive] = useState("home");

  const handleButtonClick = (section: string) => {
    setActive(section);
  };

  const handleSearchClick = () => {
    console.log("Search icon clicked");
  };

  const handleProfileClick = () => {
    console.log("Profile icon clicked");
  };

  return (
    <Layout.Header className="navbaradmin">
      <div className="navbaradmin-container">
        {/* Logo Section */}
        <div className="navbaradmin-logo">
          <img src={cruise_ship_logo} alt="Cruise Ship Logo" />
          <h1 className="navbaradmin-title">Cruise Ship Admin</h1>
        </div>

        {/* Menu Section */}
        <nav className="navbaradmin-menu">
          <Link to="/admin/promotion">
            <button
              className={`navbaradmin-button ${
                active === "Promotion" ? "active" : ""
              }`}
              onClick={() => handleButtonClick("Promotion")}
            >
              Promotion
            </button>
          </Link>
          <Link to="/reviewforcustomer/fullcontent">
            <button
              className={`navbaradmin-button ${
                active === "Review" ? "active" : ""
              }`}
              onClick={() => handleButtonClick("Review")}
            >
              Review
            </button>
          </Link>
          <Link to="/food-service/login/menu/order">
            <button
              className={`navbaradmin-button ${
                active === "Food-Service" ? "active" : ""
              }`}
              onClick={() => handleButtonClick("Food-Service")}
            >
              Food-Service
            </button>
          </Link>
          <Link to="/contact">
            <button
              className={`navbaradmin-button ${
                active === "Contact" ? "active" : ""
              }`}
              onClick={() => handleButtonClick("Contact")}
            >
              Contact
            </button>
          </Link>
        </nav>

        {/* Action Icons Section */}
        <div className="navbaradmin-actions">
          <Tooltip title="Search">
            <SearchOutlined
              className="navbaradmin-icon"
              onClick={handleSearchClick}
            />
          </Tooltip>
          <Tooltip title="Profile">
            <UserOutlined
              className="navbaradmin-icon"
              onClick={handleProfileClick}
            />
          </Tooltip>
        </div>
      </div>
    </Layout.Header>
  );
};

export default NavbarAdmin;
