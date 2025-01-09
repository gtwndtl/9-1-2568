import { useState, useEffect } from "react";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import {
  GetPromotions,
  GetPromotionStatus,
  GetDiscountType,
} from "../../../service/htpps/PromotionAPI";
import { PromotionInterface } from "../../../interface/Promotion";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "./promotripcode.css";
import { Link } from "react-router-dom";
import { IoChevronBackSharp } from "react-icons/io5";
import NavbarAdmin from "../../../../navbaradmin/navbar";


dayjs.extend(duration);

function PromotionTripPage() {
  const [promotions, setPromotions] = useState<PromotionInterface[]>([]);
  const [originalPromotions, setOriginalPromotions] = useState<PromotionInterface[]>([]);
  const [promotionStatuses, setPromotionStatuses] = useState<Record<number, string>>({});
  const [promotionDiscounts, setPromotionDiscounts] = useState<Record<number, string>>({});
  const [messageApi, contextHolder] = message.useMessage();
  const [countdownMap, setCountdownMap] = useState<Record<string, string>>({});

  const getPromotions = async () => {
    const res = await GetPromotions();
    if (res.status === 200) {
      const activePromotions = res.data.filter(
        (promo: { end_date: string | null; status_id: number; type_id: number }) =>
          promo.end_date &&
          dayjs(promo.end_date).isAfter(dayjs()) && // ตรวจสอบวันหมดอายุ
          promo.status_id == 1 &&
          promo.type_id === 1
      );

      // เรียงโปรโมชั่นตามวันหมดอายุ (ใกล้หมดอยู่บนสุด)
      activePromotions.sort((a: { end_date: dayjs.Dayjs | null | undefined; }, b: { end_date: dayjs.Dayjs | null | undefined; }) => dayjs(a.end_date).diff(dayjs(b.end_date)));

      setPromotions(activePromotions);
      setOriginalPromotions(activePromotions);
    } else {
      setPromotions([]);
      setOriginalPromotions([]);
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดโปรโมชั่นได้",
      });
    }
  };

  const isExpiringSoon = (endDate: string | null): boolean => {
    if (!endDate) return false;
    const remainingDays = dayjs(endDate).diff(dayjs(), "day");
    return remainingDays <= 3; // กำหนดเกณฑ์ใกล้หมดอายุใน 3 วัน
  };

  const calculateCountdown = () => {
    const newCountdownMap: Record<string, string> = {};
    originalPromotions.forEach((promo) => {
      if (promo.end_date) {
        const remainingTime = dayjs(promo.end_date).diff(dayjs());
        if (remainingTime > 0) {
          const durationObj = dayjs.duration(remainingTime);
          newCountdownMap[promo.code] = `${durationObj.days()} วัน ${durationObj.hours()} ชั่วโมง ${durationObj.minutes()} นาที`;
        } else {
          newCountdownMap[promo.code] = "หมดอายุแล้ว";
        }
      } else {
        newCountdownMap[promo.code] = "ไม่มีข้อมูลวันหมดอายุ";
      }
    });
    setCountdownMap(newCountdownMap);
  };

  const getPromotionStatuses = async () => {
    const res = await GetPromotionStatus();
    if (res.status === 200) {
      const statusMap = res.data.reduce(
        (acc: Record<number, string>, status: { ID: number; status: string }) => {
          acc[status.ID] = status.status;
          return acc;
        },
        {}
      );
      setPromotionStatuses(statusMap);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดสถานะโปรโมชั่นได้",
      });
    }
  };

  const getPromotionDiscounts = async () => {
    const res = await GetDiscountType();
    if (res.status === 200) {
      const discountMap = res.data.reduce(
        (acc: Record<number, string>, discount: { ID: number; discount_type: string }) => {
          acc[discount.ID] = discount.discount_type;
          return acc;
        },
        {}
      );
      setPromotionDiscounts(discountMap);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดประเภทส่วนลดได้",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        messageApi.success("คัดลอกโค้ดโปรโมชั่นแล้ว!");
      })
      .catch(() => {
        messageApi.error("ไม่สามารถคัดลอกโค้ดโปรโมชั่น");
      });
  };

  useEffect(() => {
    getPromotions();
    getPromotionStatuses();
    getPromotionDiscounts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => calculateCountdown(), 60000);
    calculateCountdown();
    return () => clearInterval(timer);
  }, [originalPromotions]);

  return (
    <div style={{ width: "100%" }}>
      <NavbarAdmin/>
      <div className="promofoodcode-container">
        {/* กลับไปหน้าเมนูอาหาร */}
        <Link to={"/promotionadmin"}>
          <IoChevronBackSharp size={30} className="back-to-menu" />
        </Link>
        {contextHolder}
        <h1 className="promofoodcode-title">Promotions Code</h1>
        {/* Section for expiring promotions */}
        <div className="expiring-section">
          <h2 className="expiring-title">Expire Soon!<span className="expiring-divider"></span>
          </h2>
          <div className="promofoodcode-list">
            {promotions
              .filter((item) => isExpiringSoon(item.end_date))
              .map((item) => (
                <div
                  className={`promofoodcode-card expiring-soon`}
                  key={item.code}
                >
                  <div className="promofoodcode-preview-expiring-soon">
                    <h6>{item.code}</h6>
                    <h2>{item.name}</h2>
                    <p className="promofoodcode-preview-detail">{item.details}</p>
                  </div>

                  <div className="promofoodcode-details">
                    <p><b>ใช้ได้ถึง:</b> {item.end_date ? `${dayjs(item.end_date).format("DD MMMM YYYY")}` : "-"}</p>
                    <p><b>ประเภทส่วนลด:</b> {promotionDiscounts[item.discount_id] || "-"}</p>
                    <p><b>สถานะ:</b> {promotionStatuses[item.status_id] || "-"}</p>
                    <p><b>เวลาที่เหลือ:</b> {countdownMap[item.code] || "-"}</p>
                    <div className="progress-bar-container">
                      <div
                        className="expiring-progress-bar"
                        style={{
                          width: `${(item.count_limit / item.limit) * 100}%`
                        }}
                      ></div>
                      <span className="progress-text">
                        {item.count_limit} / {item.limit}
                      </span>
                    </div>
                    <Button
                      className="expiring-promofoodcode-ant-btn-primary"
                      icon={<CopyOutlined />}
                      type="primary"
                      shape="round"
                      onClick={() => copyToClipboard(item.code)}
                      disabled={item.count_limit >= item.limit}
                    >
                      คัดลอกโค้ด
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section for normal promotions */}
        <div className="normal-section">
          <h2 className="normal-title">
            Recommended
            <span className="normal-divider"></span>
          </h2>
          <div className="promofoodcode-list">
            {promotions
              .filter((item) => !isExpiringSoon(item.end_date))
              .map((item) => (
                <div className={`promofoodcode-card`} key={item.code}>
                  <div className="promofoodcode-preview">
                    <h6>{item.code}</h6>
                    <h2>{item.name}</h2>
                    <p className="promofoodcode-preview-detail">{item.details}</p>
                  </div>

                  <div className="promofoodcode-details">
                    <p><b>ใช้ได้ถึง:</b> {item.end_date ? `${dayjs(item.end_date).format("DD MMMM YYYY")}` : "-"}</p>
                    <p><b>ประเภทส่วนลด:</b> {promotionDiscounts[item.discount_id] || "-"}</p>
                    <p><b>สถานะ:</b> {promotionStatuses[item.status_id] || "-"}</p>
                    <p><b>เวลาที่เหลือ:</b> {countdownMap[item.code] || "-"}</p>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${(item.count_limit / item.limit) * 100}%`
                        }}
                      ></div>
                      <span className="progress-text">
                        {item.count_limit} / {item.limit}
                      </span>
                    </div>
                    <Button
                      className="promofoodcode-ant-btn-primary"
                      icon={<CopyOutlined />}
                      type="primary"
                      shape="round"
                      onClick={() => copyToClipboard(item.code)}
                      disabled={item.count_limit >= item.limit}
                    >
                      คัดลอกโค้ด
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

}

export default PromotionTripPage;
