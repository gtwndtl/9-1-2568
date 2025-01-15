import { useEffect, useState } from "react";
import { Avatar, Rate, Spin } from "antd";
import dayjs from "dayjs";
import "swiper/swiper-bundle.css"; // Swiper CSS
import "./ReviewFoodShow.css"; // External CSS
import { GetReviews } from "../../../service/ReviewAPI";
import { GetUsersById } from "../../../../services/https";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Mousewheel, EffectCoverflow, Autoplay } from "swiper/modules"; // Import Autoplay
import { useNavigate } from "react-router-dom";

export default function ReviewFoodShow() {
  const [reviewedFoodItems, setReviewedFoodItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reviews] = await Promise.all([GetReviews()]);
      if ([reviews].some((response) => response.status !== 200)) {
        throw new Error("Failed to fetch necessary data.");
      }
      const enrichedReviews = (
        await Promise.all(
          reviews.data
            .filter((review: { review_type_id: number }) => review.review_type_id === 2) // กรองเฉพาะ review_type_id === 2
            .map(async (review: { customer_id: number; order_id: any }) => {
              const userResponse = await GetUsersById(review.customer_id);
              if (userResponse.status !== 200) {
                throw new Error("Failed to fetch user details.");
              }
              return {
                ...review,
                user: userResponse.data,
              };
            })
        )
      ).slice(0, 10); // จำกัดการ fetch แค่ 10 รีวิว
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

  const navigate = useNavigate(); // ใช้ useNavigate เพื่อเปลี่ยนเส้นทาง
  const handleSeeAllButtonClick = () => {
    navigate("/reviews/food-service"); // กำหนดเส้นทางเมื่อกดปุ่ม
  };

  // Fake Card Data
  const fakeCardData = Array.from({ length: 10 }, (_, index) => ({
    user: {
      first_name: `User`,
      last_name: `${index + 1}`,
      picture: `https://picsum.photos/60/60?random=${index + 1}`, // ใช้ภาพสุ่ม
    },
    review_text: `This is a fake review for User ${index + 1}. Explore more reviews to see real customer experiences!`,
    review_date: dayjs().subtract(index, "day").toISOString(), // วันก่อนหน้านี้
    overall_rating: Math.floor(Math.random() * 5) + 1, // คะแนน 1-5
    pictures: [
      `https://picsum.photos/300/200?random=${index + 1}`,
      `https://picsum.photos/300/200?random=${index + 2}`,
    ], // รูปภาพจำลอง
  }));

  return (
    <div className="review-container" id="review-section">
      {/* Left Section */}
      <div className="left-section">
        <h1 className="title">Savor the Moments</h1>
        <p className="quote">"Great things never come from comfort zones"</p>
        <p className="subtitle">
          Discover what our customers say about their experience with our exquisite dishes.
        </p>
        <button className="new-button" onClick={handleSeeAllButtonClick}>
          <span className="new-button-content">See All Reviews</span>
        </button>
      </div>
      {/* Right Section */}
      <div className="right-section">
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            loop={true} // Enable infinite looping
            spaceBetween={30}
            autoplay={{
              delay: 3000, // Set the delay between transitions (in milliseconds)
              disableOnInteraction: false, // Ensure autoplay continues after user interaction
            }}
            pagination={{
              clickable: true, // Allow pagination dots to be clickable
            }}
            keyboard={{ enabled: true }}
            mousewheel={true}
            modules={[EffectCoverflow, Pagination, Keyboard, Mousewheel, Autoplay]} // Include Autoplay module
            coverflowEffect={{
              rotate: 10,
              stretch: 20,
              depth: 200,
              modifier: 1,
              slideShadows: false,
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 3 }, // Show 3 slides at a time for larger screens
            }}
            className="review-swiper"
          >
            {Array.from({ length: 10 }).map((_, index) => {
              const review =
                reviewedFoodItems[index] || fakeCardData[index]; // ใช้ข้อมูลจริงก่อน ถ้าไม่มีใช้ Fake Card

              return (
                <SwiperSlide key={index}>
                  <div className="review-card">
                    <div className="review-header">
                      <Avatar
                        src={review.user.picture}
                        size={60}
                        className="review-avatar"
                        alt={`${review.user.first_name} ${review.user.last_name}`}
                      />
                      <div className="review-info">
                        <h3 className="reviewer-name">{`${review.user.first_name} ${review.user.last_name}`}</h3>
                        <Rate
                          allowHalf
                          disabled
                          defaultValue={review.overall_rating}
                          className="review-rating"
                        />
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-text">"{review.review_text}"</p>
                      <p className="review-date">
                        Reviewed on {dayjs(review.review_date).format("MMMM D, YYYY")}
                      </p>
                    </div>
                    {/* Pictures Section */}
                    <div
                      className={`review-pictures ${
                        review.pictures?.length === 1
                          ? "one"
                          : review.pictures?.length === 2
                          ? "two"
                          : "three"
                      }`}
                    >
                      {review.pictures && review.pictures.length > 0 ? (
                        review.pictures.map((pic: string, idx: number) => (
                          <div key={idx} className="picture-wrapper">
                            <img
                              src={pic}
                              alt={`Review Pic ${idx + 1}`}
                              className="review-picture"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="no-pictures">No pictures available</p>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </div>
  );
}
