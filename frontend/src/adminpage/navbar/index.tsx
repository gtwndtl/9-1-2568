import React from "react";
import { Dropdown, Layout, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {  UserOutlined } from "@ant-design/icons";
import cruise_ship_logo from "../../assets/cruise_ship_logo.jpg";
import "./index.css";

const NavbarAdmin: React.FC = () => {
  const location = useLocation(); // ใช้สำหรับตรวจสอบ URL ปัจจุบัน
  const navigate = useNavigate(); // ใช้สำหรับนำทาง
  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "profile":
        console.log("Profile clicked");
        break;
      case "review":
        navigate("/customer/review");
        break;
      case "logout":
        navigate("/");
        break;
      default:
        break;
    }
  };
  // เมนู dropdown
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="review" icon={<UserOutlined />}>
        Review
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" danger>
        Logout
      </Menu.Item>
    </Menu>
  );

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
              className={`navbaradmin-button ${location.pathname.startsWith("/admin/promotion") ? "active" : ""
                }`}
            >
              Promotion
            </button>
          </Link>
          <Link to="/food-service/login/menu/order">
            <button
              className={`navbaradmin-button ${location.pathname === "/food-service/login/menu/order"
                ? "active"
                : ""
                }`}
            >
              Food-Service
            </button>
          </Link>
        </nav>

        {/* Action Icons Section */}
        <div className="navbaradmin-actions">
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <UserOutlined
              className="navbaradmin-icon"
              onClick={(e) => e.preventDefault()} // Prevent default link behavior
              style={{ fontSize: "20px", cursor: "pointer" }}
            />
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};

export default NavbarAdmin;
