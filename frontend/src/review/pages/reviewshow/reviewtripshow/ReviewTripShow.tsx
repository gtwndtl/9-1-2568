import { useEffect, useState } from "react";
import { Spin } from "antd";
import "swiper/swiper-bundle.css";
import "./ReviewTripShow.css";
import { GetReviews } from "../../../service/ReviewAPI";
import { GetUsersById } from "../../../../services/https";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { GetBookingTripById } from "../../../../booking_cabin/service/https/BookingTripAPI";
import { GetCruiseTripById } from "../../../../booking_cabin/service/https/CruiseTripAPI";

export default function ReviewTripShow() {
  const [reviewedFoodItems, setReviewedFoodItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reviews] = await Promise.all([GetReviews()]);
      const enrichedReviews = (
        await Promise.all(
          reviews.data
            .filter((review: { review_type_id: number }) => review.review_type_id === 1)
            .map(async (review: { customer_id: number; booking_trip_id: number }) => {
              const userResponse = await GetUsersById(review.customer_id);
              const bookingTripResponse = await GetBookingTripById(review.booking_trip_id);

              if (userResponse.status !== 200 || bookingTripResponse.status !== 200) {
                throw new Error("Failed to fetch user or booking trip details.");
              }

              const cruiseTripResponse = await GetCruiseTripById(
                bookingTripResponse.data.CruiseTripID
              );

              return {
                ...review,
                user: userResponse.data,
                bookingTrip: bookingTripResponse.data,
                cruiseTrip: cruiseTripResponse.status === 200 ? cruiseTripResponse.data : null,
              };
            })
        )
      ).slice(0, 10); // จำกัดจำนวนรีวิวที่แสดง 10 อัน
      setReviewedFoodItems(enrichedReviews);
    } catch (error) {
      console.error("Error fetching reviewed items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="review-trip-card-container" id="review-trip-card-section">
      <div className="top-section"><h1
        style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#333',
          marginBottom: '16px',
          lineHeight: '1.4',
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        Perfect journeys begin with stories from real travelers
      </h1></div>
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <Swiper
          grabCursor={true}
          loop={true}
          autoplay={{
            delay: 1, // ลด delay เพื่อให้เลื่อนไหล
            disableOnInteraction: false,
          }}
          speed={2000} // เพิ่มความเร็วของการเลื่อน
          spaceBetween={20} // ระยะห่างระหว่างการ์ด
          slidesPerView="auto" // การ์ดปรับขนาดอัตโนมัติ
          modules={[Autoplay]} // เพิ่ม Autoplay module
          className="review-trip-card-swiper"
        >
          {Array.from({ length: 10 }).map((_, index) => {
            const review = reviewedFoodItems[index]; // ตรวจสอบว่ามีข้อมูลรีวิวในตำแหน่งนี้หรือไม่
            return (
              <SwiperSlide
                key={index}
                style={{
                  flex: "0 0 20%", // ให้การ์ดกว้าง 25% ของหน้าจอ
                  maxWidth: "20%", // จำกัดความกว้างการ์ด
                }}
              >
                <div
                  className="review-trip-card"
                  style={{
                    backgroundImage: `url(${review?.pictures && review.pictures.length > 0 ? review.pictures[0] : "/path/to/default-image.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "500px",
                    display: "flex",
                    flexDirection: "column",
                    padding: "15px",
                    color: "#fff",
                    borderRadius: "10px",
                  }}
                >
                  {review ? (
                    <div
                      style={{
                        marginTop: "auto", // ทำให้เริ่มแสดงเนื้อหาจากกึ่งกลาง
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start", // ให้ข้อความเรียงจากด้านบนของพื้นที่ที่กำหนด
                        color: "#fff",
                        padding: "10px",
                        background: "rgba(0, 0, 0, 0.5)", // เพิ่มพื้นหลังโปร่งใสเพื่อให้อ่านง่าย
                        borderRadius: "10px",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{review.cruiseTrip?.CruiseTripName || "Unknown Trip"}</h3>
                      <p
                        style={{
                          fontSize: "14px",
                          margin: "5px 0",
                          textAlign: "left",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 8,
                          WebkitBoxOrient: "vertical",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                        }}
                      >
                        "{review.review_text}"
                      </p>
                      <p style={{ textAlign: "right" }}>
                        By {`${review.user.first_name} ${review.user.last_name}`}
                      </p>

                    </div>
                  ) : (
                    <div>
                      <h3 style={{ margin: 0, textAlign: "center" }}>
                        Card {index + 1}
                      </h3>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
}
