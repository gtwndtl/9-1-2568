import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { GetPromotions } from "../../service/htpps/PromotionAPI";
import "./PromotionPopUp.css";
import { PromotionInterface } from "../../interface/Promotion";
import { message } from "antd";

const PromotionPopUp = () => {
    const [, setPromotions] = useState<PromotionInterface[]>([]);
    const [randomPromotion, setRandomPromotion] = useState<PromotionInterface | null>(null); // เก็บโปรโมชั่นที่สุ่ม
    const [isVisible, setIsVisible] = useState(true); // ควบคุมการแสดงผล pop-up
    const [messageApi] = message.useMessage();

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

            setPromotions(activePromotions);

            // เลือกโปรโมชั่นแบบสุ่ม
            if (activePromotions.length > 0) {
                const randomIndex = Math.floor(Math.random() * activePromotions.length);
                setRandomPromotion(activePromotions[randomIndex]);
            }
        } else {
            setPromotions([]);
            setRandomPromotion(null);
            messageApi.open({
                type: "error",
                content: res.data.error || "ไม่สามารถโหลดโปรโมชั่นได้",
            });
        }
    };

    useEffect(() => {
        getPromotions();
    }, []);

    return (
        <section>
            {isVisible && randomPromotion && (
                <div className="card-container">
                    <div className="popup-overlay">
                        <div className="card" style={{ position: "relative" }}>
                            <button
                                className="close-button"
                                onClick={() => setIsVisible(false)} // ซ่อน pop-up เมื่อคลิกปุ่มปิด
                                aria-label="Close"
                            >
                                ✖
                            </button>
                            <div className="image">
                                <img src={randomPromotion.image} alt={randomPromotion.title} />
                            </div>
                            <div className="content">
                                <p className="text-1">Run with the pack</p>
                                <div className="text-2">
                                    {randomPromotion.discount_id === 1 ? (
                                        <>
                                            <span>Get {randomPromotion.discount}% off</span>
                                            <span>
                                                On your next order over ${randomPromotion.minimum_price}
                                            </span>
                                        </>
                                    ) : randomPromotion.discount_id === 2 ? (
                                        <>
                                            <span>Save ${randomPromotion.discount}</span>
                                            <span>
                                                On your next order over ${randomPromotion.minimum_price}
                                            </span>
                                        </>
                                    ) : null}
                                </div>
                                <button
                                    className="action"
                                    onClick={() => navigator.clipboard.writeText(randomPromotion.code)}
                                >
                                    Get Discount
                                </button>
                                <p className="date">
                                    Offer valid until{" "}
                                    {new Date(randomPromotion.end_date).toLocaleDateString()} *
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PromotionPopUp;
