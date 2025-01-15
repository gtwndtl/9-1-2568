import React, { useState, useEffect } from 'react';
import { Rate, Card, Button, Modal, Select } from 'antd';
import { GetUsersById } from '../../../../services/https/index';
import { GetOrderDetail } from '../../../../food_service/service/https/OrderDetailAPI';
import { GetMenu } from '../../../../food_service/service/https/MenuAPI';
import { GetReviews } from '../../../service/ReviewAPI';
import { ReviewInterface } from '../../../interface/Review';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { IoChevronBackSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import './allreviewsfood.css';

// เปิดใช้งาน plugin relativeTime
dayjs.extend(relativeTime);

const AllReviewsFood: React.FC = () => {
  const [reviewedFoodItems, setReviewedFoodItems] = useState<ReviewInterface[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null); // ฟิลเตอร์จำนวนดาวที่เลือก
  const [dateFilter, setDateFilter] = useState<string | null>(null); // ฟิลเตอร์วันที่
  const [isModalVisible, setIsModalVisible] = useState(false); // สำหรับแสดง Modal
  const [currentImage, setCurrentImage] = useState<string | null>(null); // สำหรับเก็บรูปที่คลิก

  const fetchData = async () => {
    try {
      const [reviews, orderDetails, menus] = await Promise.all([
        GetReviews(),
        GetOrderDetail(),
        GetMenu(),
      ]);

      if ([reviews, orderDetails, menus].some((response) => response.status !== 200)) {
        throw new Error("Failed to fetch necessary data.");
      }

      const menuMap = menus.data.reduce(
        (acc: any, menu: { ID: any; MenuName: any }) => ({ ...acc, [menu.ID]: menu.MenuName }),
        {}
      );

      const enrichedReviews = await Promise.all(
        reviews.data.filter((review: { review_type_id: number }) => review.review_type_id === 2).map(async (review: { customer_id: number; order_id: any }) => {
          const userResponse = await GetUsersById(review.customer_id);
          if (userResponse.status !== 200) {
            throw new Error("Failed to fetch user details.");
          }

          const orderDetailsForReview = orderDetails.data.filter(
            (detail: { OrderID: any }) => detail.OrderID === review.order_id
          );

          return {
            ...review,
            menuNames: orderDetailsForReview.map((detail: { MenuID: string | number }) => menuMap[detail.MenuID] || "Unknown"),
            user: userResponse.data,
          };
        })
      );

      setReviewedFoodItems(enrichedReviews);
      setFilteredReviews(enrichedReviews); // ตั้งค่าให้แสดงทั้งหมดในเริ่มต้น
    } catch (error) {
      console.error("Error fetching reviewed items:", error);
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
      setFilteredReviews(reviewedFoodItems); // ถ้าไม่มีการเลือกฟิลเตอร์ให้แสดงทั้งหมด
    } else {
      setFilteredReviews(
        reviewedFoodItems.filter((review) => review.overall_rating !== undefined && review.overall_rating >= value && review.overall_rating < value + 1)
      );
    }
  };

  const handleDateFilterChange = (value: string | null) => {
    setDateFilter(value);
    filterReviews(ratingFilter, value);
  };
  const filterReviews = (rating: number | null, date: string | null) => {
    let filtered = [...reviewedFoodItems];

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
  };


  const clearFilters = () => {
    setRatingFilter(null);
    setDateFilter(null);
    setFilteredReviews(reviewedFoodItems); // รีเซ็ตการกรอง
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentImage(null);
  };

  return (

    <div style={{ width: '100%', maxWidth:'1600px',minHeight: "100vh", padding: '40px 20px' }}>
      {/* กลับไปหน้าเมนูอาหาร */}
      <Link to={"/food-service/login/menu/order"}>
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
          See What Our Customers Say About Us
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
            "Every review is a flavor-filled journey"
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
                    padding: '4px 12px',
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


            {filteredReviews.map((review) => (
              <Card
                key={review.ID}
                type="inner"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%'}}>
                    <img
                      src={review.user.picture}
                      alt="User"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333', fontFamily: "'Roboto', sans-serif", }}>
                        {`${review.user.first_name} ${review.user.last_name}`}
                      </p>
                      <p style={{ fontSize: '14px', color: '#888', fontFamily: "'Roboto', sans-serif", }}>{review.user.email}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Rate
                          allowHalf
                          disabled
                          defaultValue={review.overall_rating}
                          style={{ fontSize: '16px', color: '#FF9800' }}
                        />
                        <p style={{ fontSize: '14px', color: '#888', margin: 0, fontFamily: "'Roboto', sans-serif", }}>
                          {dayjs(review.review_date).fromNow()}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        marginTop: '28px',
                        marginBottom: '16px',
                      }}
                    >
                      {review.pictures && review.pictures.length > 0 ? (
                        review.pictures.map((pic, idx) => (
                          <div key={idx} style={{ width: '80px', height: '80px' }}>
                            <img
                              src={pic}
                              alt={`Review Pic ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer', // เพิ่มเคอร์เซอร์เพื่อบ่งบอกว่าเป็นรูปที่สามารถคลิกได้
                              }}
                              onClick={() => handleImageClick(pic)} // คลิกเพื่อดูรูปขนาดใหญ่
                            />
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', fontFamily: "'Roboto', sans-serif", }}>No pictures available.</p>
                      )}
                    </div>
                  </div>
                }
                style={{
                  marginBottom: '24px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  padding: '24px',
                  backgroundColor: '#fff',
                  width: '100%',
                }}
              >
                {/* เนื้อหารีวิว */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      marginBottom: '16px',
                      fontSize: '20px',
                      fontWeight: '600',
                      fontFamily: "'Roboto', sans-serif",
                      color: '#333',
                    }}>
                      {review.menuNames.join(', ')} (Order #{review.order_id})
                    </h2>
                    <h4 style={{
                      marginBottom: '24px',
                      fontSize: '16px',
                      fontFamily: "'Roboto', sans-serif",
                      color: '#555',
                      lineHeight: '1.6', // เพิ่มความโปร่งเพื่อให้อ่านง่าย  
                      maxWidth: '1400px',
                      wordWrap: 'break-word', // รองรับการตัดคำยาวเกิน
                      overflowWrap: 'break-word', // เพิ่มความยืดหยุ่น
                      whiteSpace: 'normal', // ป้องกันการไม่ตัดบรรทัด
                    }}>
                      {review.review_text}
                    </h4>
                    {/* การ์ดสำหรับคะแนน */}
                    <Card
                      style={{
                        background: '#fff',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        marginTop: '28px',
                        padding: '24px',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        {/* คะแนนบริการ */}
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '16px',
                            fontFamily: "'Roboto', sans-serif",
                          }}>💼 Service</p>
                          <Rate allowHalf disabled defaultValue={review.service_rating} style={{ fontSize: '22px', color: '#4CAF50' }} />
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#888',
                            fontFamily: "'Roboto', sans-serif",
                          }}>
                            {review.service_rating} / 5
                          </p>
                        </div>

                        {/* คะแนนรสชาติ */}
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '16px',
                            fontFamily: "'Roboto', sans-serif",
                          }}>🍴 Taste</p>
                          <Rate allowHalf disabled defaultValue={review.taste_rating} style={{ fontSize: '22px', color: '#FF5722' }} />
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#888',
                            fontFamily: "'Roboto', sans-serif",
                          }}>
                            {review.taste_rating} / 5
                          </p>
                        </div>

                        {/* คะแนนราคา */}
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '16px',
                            fontFamily: "'Roboto', sans-serif",
                          }}>💵 Price</p>
                          <Rate allowHalf disabled defaultValue={review.value_for_money_rating} style={{ fontSize: '22px', color: '#FFC107' }} />
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#888',
                            fontFamily: "'Roboto', sans-serif",
                          }}>
                            {review.value_for_money_rating} / 5
                          </p>
                        </div>

                        {/* เมนูแนะนำ */}
                        <div style={{ textAlign: 'center' }}>
                          <p style={{
                            margin: 0,
                            fontWeight: '600',
                            fontSize: '16px',
                            fontFamily: "'Roboto', sans-serif",
                          }}>🍽️ Recommended Dish</p>
                          <h3 style={{
                            margin: '8px 0',
                            fontSize: '14px',
                            color: '#333',
                            fontFamily: "'Roboto', sans-serif",
                          }}>
                            {review.recommended_dishes || 'No recommended dish provided.'}
                          </h3>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        </div>
      </div>

      {/* Modal สำหรับแสดงรูปขนาดใหญ่ */}
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
          style={{ width: 'auto', height: 'auto', maxHeight: '600px' }}
        />
      </Modal>
    </div>
  );
};

export default AllReviewsFood;
