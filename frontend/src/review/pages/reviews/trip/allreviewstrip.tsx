import React, { useState, useEffect } from 'react';
import { Rate, Card, Button, Modal, Select } from 'antd';
import { GetUsersById } from '../../../../services/https/index';
import { GetReviews } from '../../../service/ReviewAPI';
import { ReviewInterface } from '../../../interface/Review';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IoChevronBackSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import './allreviewstrip.css';
import { GetBookingTrip } from '../../../../booking_cabin/service/https/BookingTripAPI';
import { GetAllCruiseTrip } from '../../../../booking_cabin/service/https/CruiseTripAPI';
import NavbarLandingPage from '../../../../landingpage/navbar/NavbarLandingPage';

// เปิดใช้งาน plugin relativeTime
dayjs.extend(relativeTime);

const generateFakeReviews = (count: number) => {
  const fakeReviews: ReviewInterface[] = Array.from({ length: count }, (_, index) => ({
    overall_rating: parseFloat((Math.random() * 5).toFixed(1)), // Random rating between 0-5
    service_rating: parseFloat((Math.random() * 5).toFixed(1)),
    cabin_rating: parseFloat((Math.random() * 5).toFixed(1)),
    value_for_money_rating: parseFloat((Math.random() * 5).toFixed(1)),
    review_text: `This is a fake review number ${index + 1}. The trip was amazing!`,
    review_date: dayjs().subtract(index, 'days').toDate(),
    customer_id: index + 1,
    booking_trip_id: index + 1,
    CruiseTripName: `Fake Cruise Trip ${index + 1}`,
    user: {
      first_name: `FakeUser${index + 1}`,
      last_name: `LastName${index + 1}`,
    },
    pictures: [
      `https://picsum.photos/300/500?random=${index + 1}`,
    ],
  }));

  return fakeReviews;
};




const AllReviewsTrip: React.FC = () => {
  const [reviewedTripItems, setReviewedTripItems] = useState<ReviewInterface[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // ฟิลเตอร์จำนวนดาวที่เลือก
  const [dateFilter, setDateFilter] = useState<string | null>(null); // ฟิลเตอร์วันที่
  const [isModalVisible, setIsModalVisible] = useState(false); // สำหรับแสดง Modal
  const [currentImage, setCurrentImage] = useState<string | null>(null); // สำหรับเก็บรูปที่คลิก
  const [currentPage, setCurrentPage] = useState(1); // หน้าเริ่มต้น
  const reviewsPerPage = 10; // จำนวนรีวิวต่อหน้า

  const fetchData = async () => {
    try {
      const [reviews, bookingTrip, cruiseTrip] = await Promise.all([
        GetReviews(),
        GetBookingTrip(),
        GetAllCruiseTrip(),
      ]);

      if ([reviews, bookingTrip, cruiseTrip].some((response) => response.status !== 200)) {
        throw new Error("Failed to fetch necessary data.");
      }

      // สร้าง mapping object จาก CruiseTrip
      const cruiseTripMap = cruiseTrip.data.reduce(
        (acc: any, cruise: { ID: any; CruiseTripName: any }) => ({
          ...acc,
          [cruise.ID]: cruise.CruiseTripName,
        }),
        {}
      );

      // สร้าง mapping object จาก BookingTrip
      const bookingTripMap = bookingTrip.data.reduce(
        (acc: any, booking: { ID: any; CruiseTripID: any }) => ({
          ...acc,
          [booking.ID]: booking.CruiseTripID, // แมป BookingTripID กับ CruiseTripID
        }),
        {}
      );

      // enrich reviews ด้วยข้อมูล BookingTrip และ CruiseTrip
      const enrichedReviews = await Promise.all(
        reviews.data
          .filter((review: { review_type_id: number }) => review.review_type_id === 1)
          .map(async (review: { customer_id: number; booking_trip_id: any }) => {
            const userResponse = await GetUsersById(review.customer_id);
            if (userResponse.status !== 200) {
              throw new Error("Failed to fetch user details.");
            }

            // หา CruiseTripID จาก BookingTripID
            const cruiseTripID = bookingTripMap[review.booking_trip_id];
            const cruiseTripName = cruiseTripMap[cruiseTripID] || "Unknown Trip";

            return {
              ...review,
              CruiseTripName: cruiseTripName,
              user: userResponse.data,
            };
          })
      );

      // เพิ่ม fake reviews
      const fakeReviews = generateFakeReviews(25); // สร้างรีวิวปลอม 25 รายการ

      setReviewedTripItems([...enrichedReviews, ...fakeReviews]); // รวมรีวิวจริงและปลอม
      setFilteredReviews([...enrichedReviews, ...fakeReviews]);
    } catch (error) {
      console.error("Error fetching reviewed trips:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0); // เลื่อนหน้าไปยังตำแหน่งบนสุด
    fetchData();
  }, []);

  // ฟังก์ชันกรองตาม rating
  const handleFilterChange = (value: number | null) => {
    setRatingFilter(value);
    if (value === null) {
      setFilteredReviews(reviewedTripItems); // ถ้าไม่มีการเลือกฟิลเตอร์ให้แสดงทั้งหมด
    } else {
      setFilteredReviews(
        reviewedTripItems.filter((review) => review.overall_rating !== undefined && review.overall_rating >= value && review.overall_rating < value + 1)
      );
    }
  };

  const handleDateFilterChange = (value: string | null) => {
    setDateFilter(value);
    filterReviews(ratingFilter, value);
  };
  const filterReviews = (rating: number | null, date: string | null) => {
    let filtered = [...reviewedTripItems];

    if (rating !== null) {
      filtered = filtered.filter(
        (review) => review.overall_rating !== undefined && review.overall_rating >= rating && review.overall_rating < rating + 1
      );
    }

    if (date === "asc") {
      filtered.sort((a, b) => dayjs(a.review_date).isBefore(dayjs(b.review_date)) ? -1 : 1);
    } else if (date === "desc") {
      filtered.sort((a, b) => dayjs(a.review_date).isAfter(dayjs(b.review_date)) ? -1 : 1);
    }

    setFilteredReviews(filtered);
    setCurrentPage(1); // รีเซ็ตหน้าหลังกรอง
  };


  const clearFilters = () => {
    setRatingFilter(null);
    setDateFilter(null);
    setFilteredReviews(reviewedTripItems); // รีเซ็ตการกรอง
    setCurrentPage(1); // รีเซ็ตหน้าหลังเคลียร์ฟิลเตอร์
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentImage(null);
  };

  // Pagination Logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // เลื่อนหน้าไปด้านบนเมื่อเปลี่ยนหน้า
  };

  const colorClasses = [
    "projcard-blue",
    "projcard-red",
    "projcard-green",
    "projcard-yellow",
    "projcard-orange",
    "projcard-brown",
    "projcard-grey",
  ];

  // ฟังก์ชันสุ่มสี
  const getRandomColorClass = () => {
    const randomIndex = Math.floor(Math.random() * colorClasses.length);
    return colorClasses[randomIndex];
  };


  return (
    <div>
      <NavbarLandingPage />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div className='trip-review-page' style={{ width: '100%', maxWidth: '1600px', minHeight: "100vh", padding: '40px 20px' }}>
          {/* กลับไปหน้าHome */}
          <Link to={"/home"}>
            <IoChevronBackSharp size={30} className="back-to-menu" />
          </Link>
          {/* Header Section */}
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              borderRadius: '12px',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '16px',
                lineHeight: '1.4',
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              What Travelers Loved About Their Trips
            </h1>
            <div
              style={{
                fontSize: '24px',
                color: '#555',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6',
                fontStyle: 'italic',
                fontFamily: "'Roboto', sans-serif",
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  animation: 'typing 6s steps(60, end) infinite, blink 0.5s step-end infinite',
                  fontFamily: "'Roboto', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderRight: '3px solid #007aff',
                  width: '0', // Starts at 0 width for the typing effect
                }}
              >
                "Go where you feel most alive"
              </span>
            </div>
          </div>


          {/* เส้นแบ่ง */}
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: '#ddd',
            margin: '20px 0'
          }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '100%', padding: '20px', backgroundColor: 'white', borderRadius: '16px' }}>
              <Card style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}>
                  {/* Filter by Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      ⭐ Rating:
                    </span>
                    <Rate
                      allowClear
                      value={ratingFilter ?? undefined}
                      onChange={handleFilterChange}
                      style={{
                        fontSize: '20px',
                        color: '#FF9800',
                        cursor: 'pointer' // เพิ่ม cursor ให้เหมือน Apple Design
                      }}
                    />
                  </div>

                  {/* Filter by Date */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#333',
                      fontFamily: "'Roboto', sans-serif",
                    }}>
                      📅 Date:
                    </span>
                    <Select
                      value={dateFilter}
                      onChange={handleDateFilterChange}
                      style={{
                        width: 160,
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: "'Roboto', sans-serif",
                      }}
                      placeholder="All"
                    >
                      <Select.Option value="asc">Oldest First</Select.Option>
                      <Select.Option value="desc">Newest First</Select.Option>
                    </Select>
                  </div>

                  {/* Clear Filter */}
                  <Button
                    onClick={clearFilters}
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#007AFF',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      fontFamily: "'Roboto', sans-serif",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0056D2'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#007AFF'}
                  >
                    Clear Filters
                  </Button>
                </div>


                <div className="projcard-container">
                  {currentReviews.map((review, index) => (
                    <div
                      key={index}
                      className={`projcard ${getRandomColorClass()}`} // เพิ่ม class สีที่สุ่ม
                    >
                      <div className="projcard-innerbox">
                        {/* Overall Rating */}
                        <div className="projcard-rating">
                          {review.overall_rating !== undefined ? review.overall_rating.toFixed(1) : "N/A"} ⭐
                        </div>

                        {/* Top-right Images */}
                        <div className="projcard-top-images">
                          {review.pictures && review.pictures.length > 0 ? (
                            review.pictures.slice(0, 3).map((pic, idx) => (
                              <img
                                key={idx}
                                className="projcard-thumbnail"
                                src={pic}
                                alt={`Thumbnail ${idx + 1}`}
                                onClick={() => handleImageClick(pic)} // เรียกฟังก์ชัน handleImageClick เมื่อคลิก
                                style={{ cursor: 'pointer' }} // เพิ่ม cursor pointer เพื่อให้ชัดเจนว่าสามารถคลิกได้
                              />
                            ))
                          ) : (
                            <img
                              className="projcard-thumbnail"
                              src="https://via.placeholder.com/100x100?text=No+Image"
                              alt="No Thumbnail"
                            />
                          )}
                        </div>


                        {/* Review Image */}
                        <img
                          className="projcard-img"
                          src={
                            review.pictures && review.pictures.length > 0
                              ? review.pictures[0]
                              : "https://via.placeholder.com/800x600?text=No+Image"
                          }
                          alt={`Review by ${review.user.first_name}`}
                        />
                        <div className="projcard-textbox">
                          {/* Review Title */}
                          <div className="projcard-title">{review.CruiseTripName || "Unknown Trip"}</div>

                          {/* Review Subtitle */}
                          <div className="projcard-subtitle">
                            Reviewed by {review.user.first_name} {review.user.last_name}
                          </div>

                          {/* Bar Divider */}
                          <div className="projcard-bar"></div>

                          {/* Review Description */}
                          <div className="projcard-description">
                            {review.review_text || "No review text available."}
                          </div>

                          {/* Ratings */}
                          <div className="projcard-tagbox">
                            <span className="projcard-tag">Service: {review.service_rating} ⭐</span>
                            <span className="projcard-tag">Cabin: {review.cabin_rating} ⭐</span>
                            <span className="projcard-tag">Price: {review.value_for_money_rating} ⭐</span>
                          </div>
                          {/* Review Date */}
                          <div className="projcard-date">
                            {review.review_date ? dayjs(review.review_date).fromNow() : "No date available"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          <div className="pagination-container">
            {/* Previous Page */}
            <button
              className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => changePage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}

            {/* Next Page */}
            <button
              className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
          </div>


          <Modal
            visible={isModalVisible}
            footer={null}
            onCancel={handleCancel}
            width={800}
            bodyStyle={{ textAlign: 'center' }}
          >
            <img
              src={currentImage || ''}
              alt="Enlarged"
              style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }} // ปรับให้รูปพอดีกับ Modal
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AllReviewsTrip;
