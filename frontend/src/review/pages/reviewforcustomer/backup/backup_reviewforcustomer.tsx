import React, { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, Rate, Card, message, Upload, Image as AntImage, Dropdown, Menu, Select } from 'antd';
import { GetUsersById } from '../../../../services/https/index'; // แก้ให้ตรงกับ Service API ของคุณ
import { GetOrder } from '../../../../food_service/service/https/OrderAPI';
import { GetOrderDetail } from '../../../../food_service/service/https/OrderDetailAPI';
import { GetMenu } from '../../../../food_service/service/https/MenuAPI';
import { GetFoodServicePayment } from '../../../../payment/service/https/FoodServicePaymentAPI';
import { CreateReview, DeleteReviewById, GetReviews, GetReviewTypes, UpdateReviewById } from '../../../service/ReviewAPI';
import { ReviewInterface } from '../../../interface/Review';
import { MenuInterface } from '../../../../food_service/interface/IMenu';
import { FoodServicePaymentInterface } from '../../../../payment/interface/IFoodServicePayment';
import { DeleteOutlined, DownOutlined, EllipsisOutlined, UploadOutlined, UpOutlined } from '@ant-design/icons';
import Navbar from '../../../../navbaradmin/navbar';
import { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// เปิดใช้งาน plugin relativeTime
dayjs.extend(relativeTime);

const customerID = Number(localStorage.getItem('id'));

const ReviewForCustomer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviewed' | 'notReviewed'>('reviewed');
  const [reviewedFoodItems, setReviewedFoodItems] = useState<ReviewInterface[]>([]);
  const [notReviewedItems, setNotReviewedItems] = useState<ReviewInterface[]>([]);
  const [isReviewedLoaded, setIsReviewedLoaded] = useState(false);
  const [isNotReviewedLoaded, setIsNotReviewedLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [currentReview, setCurrentReview] = useState<ReviewInterface | null>(null);
  const [reviewTypes, setReviewTypes] = useState<Record<number, string>>({});
  const [base64CreateImages, setBase64CreateImages] = useState<string[]>([]);
  const [uploadedEditImages, setUploadedEditImages] = useState<string[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | number | null>(null);
  const [, setImageCount] = useState<number>(0); // เก็บจำนวนรูปที่อัปโหลด
  const [maxImages] = useState(3); // จำนวนรูปสูงสุดที่สามารถอัปโหลดได้ั


  // Fetch Reviewed Items
  useEffect(() => {
    const fetchReviewedItems = async () => {
      if (!isReviewedLoaded) {
        try {
          const reviewResponse = await GetReviews();
          if (reviewResponse.status !== 200) throw new Error('Failed to fetch reviews.');
          const allReviews = reviewResponse.data;

          // กรองเฉพาะรีวิวของ Customer ID
          const customerReviews = allReviews.filter(
            (review: any) => review.customer_id === customerID && review.review_type_id === 2
          );

          // ดึงข้อมูล OrderDetail
          const orderDetailResponse = await GetOrderDetail();
          if (orderDetailResponse.status !== 200) throw new Error('Failed to fetch order details.');
          const allOrderDetails = orderDetailResponse.data;

          // ดึงข้อมูล Menu
          const menuResponse = await GetMenu();
          if (menuResponse.status !== 200) throw new Error('Failed to fetch menu.');
          const allMenus = menuResponse.data;

          // สร้าง Map ของ Menu ID กับชื่อเมนู
          const menuMap = allMenus.reduce((acc: Record<number, string>, menu: any) => {
            acc[menu.ID] = menu.MenuName;
            return acc;
          }, {});

          // เชื่อมโยงชื่อเมนูเข้ากับรีวิว
          const enrichedReviews = customerReviews.map((review: any) => {
            const orderDetails = allOrderDetails.filter(
              (detail: any) => detail.OrderID === review.order_id
            );
            return {
              ...review,
              menuNames: orderDetails.map((detail: any) => menuMap[detail.MenuID] || 'Unknown'),
            };
          });

          setReviewedFoodItems(enrichedReviews);
          setIsReviewedLoaded(true);
        } catch (error) {
          console.error('Error fetching reviewed items:', error);
        }
      }
    };


    if (activeTab === 'reviewed') {
      fetchReviewedItems();
    }
  }, [activeTab, isReviewedLoaded]);




  // Fetch Not Reviewed Items
  useEffect(() => {
    const fetchNotReviewedItems = async () => {
      if (!isNotReviewedLoaded) {
        try {
          const ordersResponse = await GetOrder();
          if (ordersResponse.status !== 200) throw new Error('Failed to fetch orders.');
          const allOrders = ordersResponse.data;

          // กรองเฉพาะ Orders ของ Customer ID ที่มีสถานะเป็น "paid"
          const customerOrders = allOrders.filter(
            (orders: any) => orders.CustomerID === customerID && orders.Status === "Paid"
          );

          // ดึง ID ของ Order ที่มีการรีวิวแล้ว
          const reviewedOrderIds = reviewedFoodItems.map((review) => review.order_id);


          // กรองเฉพาะ Orders ที่ยังไม่มีการรีวิว
          const notReviewedOrders = customerOrders.filter(
            (order: any) => !reviewedOrderIds.includes(order.ID)
          );

          // ดึงรายละเอียดของ Order จาก API GetOrderDetail
          const ordersDetailsResponse = await GetOrderDetail();
          if (ordersDetailsResponse.status !== 200) throw new Error('Failed to fetch order details.');
          const allOrderDetails = ordersDetailsResponse.data;

          // ดึงรายละเอียดของ Menu ทั้งหมด
          const menuResponse = await GetMenu(); // สมมติว่าฟังก์ชันนี้ดึงเมนูทั้งหมดได้
          if (menuResponse.status !== 200) throw new Error('Failed to fetch menu details.');
          const allMenus = menuResponse.data;

          // ดึงรายละเอียดของ Food Service Paments ทั้งหมด
          const foodpaymentResponse = await GetFoodServicePayment(); // สมมติว่าฟังก์ชันนี้ดึงเมนูทั้งหมดได้
          if (foodpaymentResponse.status !== 200) throw new Error('Failed to fetch Food Service Payment.');
          const allFoodPayment = foodpaymentResponse.data;

          // สร้าง Map ระหว่าง MenuID และ MenuName
          const menuMap = allMenus.reduce((acc: Record<number, string>, menu: MenuInterface) => {
            acc[menu.ID] = menu.MenuName;

            return acc;
          }, {});

          // สร้าง Map ระหว่าง MenuID และ MenuPrice
          const menuPriceMap = allMenus.reduce((acc: Record<number, number>, menu: MenuInterface) => {
            acc[menu.ID] = menu.Price;
            return acc;
          }, {});

          // สร้าง Map ระหว่าง MenuID และ MenuImage
          const menuImage = allMenus.reduce((acc: Record<number, string>, menu: MenuInterface) => {
            acc[menu.ID] = menu.ImageMenu;
            return acc;
          }, {});

          // สร้าง enrichedOrders พร้อมข้อมูลทั้งหมด
          const enrichedOrders = notReviewedOrders.map((order: any) => {
            const relatedDetails = allOrderDetails.filter((detail: any) => detail.OrderID === order.ID);
            const payment = allFoodPayment.find((p: FoodServicePaymentInterface) => p.OrderID === order.ID);

            return {
              id: order.ID,
              review_type_id: 2,
              title: `Order #${order.ID}`,
              status: order.Status,
              menuDetails: relatedDetails.map((detail: any) => ({
                menuName: menuMap[detail.MenuID] || 'Unknown',
                quantity: detail.Quantity || 0,
                amount: detail.Amount || 0,
                menuPrice: menuPriceMap[detail.MenuID] || 'Unknown',
                menuImage: menuImage[detail.MenuID] || 'Unknown',
              })),
              totalPrice: payment ? payment.Price : 'Unknown',
              paymentDate: payment ? payment.PaymentDate : 'Unknown', // ดึง paymentDate จาก payment
              paymentID: payment ? payment.ID : 'Unknown', // ดึง paymentID จาก payment
              paymentMethod: payment ? payment.PaymentMethod : 'Unknown', // ดึง paymentID จาก payment
            };
          });

          setNotReviewedItems(enrichedOrders);
          setIsNotReviewedLoaded(true);
        } catch (error) {
          console.error('Error fetching not reviewed items:', error);
        }
      }
    };

    if (activeTab === 'notReviewed') {
      fetchNotReviewedItems();
    }
  }, [activeTab, isNotReviewedLoaded]);


  useEffect(() => {
    const fetchUserInfo = async () => {
      if (customerID) {
        try {
          const res = await GetUsersById(customerID);
          if (res.status === 200) {
            setUserInfo(res.data);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    const getReviewTypes = async () => {
      const res = await GetReviewTypes();
      if (res.status === 200) {
        const reviewtypeMap = res.data.reduce(
          (acc: Record<number, string>, review_types: { ID: number; review_type: string }) => {
            acc[review_types.ID] = review_types.review_type;
            return acc;
          },
          {}
        );
        setReviewTypes(reviewtypeMap);
      } else {
        message.error({
          type: "error",
          content: res.data.error || "ไม่สามารถโหลดประเภทรีวิวได้",
        });
      }
    };
    fetchUserInfo();
    getReviewTypes();
  }, [customerID]);

  const handleAddReview = (order: ReviewInterface) => {
    // Extract menu names from order.menuDetails and update the state
    const menuNames = order.menuDetails?.map((detail: { menuName: any; }) => detail.menuName) || [];

    // Set the current review state with menuNames
    setCurrentReview({
      ...order,
      menuNames: menuNames, // Set menuNames in the state
    });

    // Set the form fields, including recommended dish dropdown
    form.setFieldsValue({
      reviewtype: order.review_type_id !== undefined ? reviewTypes[order.review_type_id] : '',
      title: order.title,
      menuNames: menuNames.join(' , '),
      recommended_dish: menuNames[0] || 'Unknown', // Set the first menuName as default
    });

    setIsModalOpen(true); // Open the modal
  };




  const onFinish = async (values: any) => {
    if (currentReview) {
      const overallRating = (Number(values.service_rating) + Number(values.price_rating) + Number(values.taste_rating)) / 3;

      const newReview: ReviewInterface = {
        Review_date: new Date(),
        Review_text: values.review_text,
        Service_rating: values.service_rating,
        Price_rating: values.price_rating,
        Taste_rating: values.taste_rating,
        Overall_rating: overallRating, // Dynamically calculate the overall rating
        review_type_id: 2,
        order_id: currentReview.id,
        food_service_payment_id: currentReview.paymentID,
        customer_id: Number(customerID),
        pictures: base64CreateImages,
      };

      const res = await CreateReview(newReview);
      if (res.status === 201) {
        message.open({
          type: "success",
          content: "สร้างรีวิวสำเร็จ!",
        });
        setTimeout(() => {
          window.location.href = "/review";
        }, 2000);
      } else {
        message.open({
          type: "error",
          content: res.data.error || "ไม่สามารถสร้างรีวิวได้!",
        });
      }

      setNotReviewedItems(notReviewedItems.filter((item) => item.ID !== currentReview.ID));
      setIsModalOpen(false);
    }
  };

  const handleCreateImageUpload = (file: any) => {
    const readerCreate = new FileReader();
    readerCreate.onload = () => {
      setBase64CreateImages((prevCreateImages) => [...prevCreateImages, readerCreate.result as string]);
    };
    readerCreate.readAsDataURL(file);
    return false; // Prevent upload
  };


  // ฟังก์ชันสำหรับการอัปโหลดรูป
  const handleEditUpload = async (file: RcFile) => {
    const existingImages = form.getFieldValue('pictures') || []; // รูปในฟอร์ม
    const validImages = existingImages.filter((image: string) => image.startsWith('data:image'));
    const totalImages = validImages.length;

    if (totalImages >= maxImages) {
      message.error('คุณสามารถอัปโหลดรูปได้สูงสุด 3 รูป');
      return false;
    }

    const readerEdit = new FileReader();
    readerEdit.readAsDataURL(file);
    readerEdit.onloadend = () => {
      const base64EditImage = readerEdit.result as string;

      if (base64EditImage && base64EditImage.startsWith('data:image')) {
        const updatedImages = [...existingImages, base64EditImage];
        form.setFieldsValue({
          pictures: updatedImages,
        });
        setUploadedEditImages(updatedImages); // อัปเดต state ของภาพที่อัปโหลดแล้ว
      } else {
        message.error('ไฟล์รูปไม่ถูกต้อง');
      }
    };

    return false; // ป้องกันการอัปโหลดปกติ
  };

  // ฟังก์ชันสำหรับลบรูป
  const handleImageDelete = (index: number) => {
    const currentPictures = form.getFieldValue('pictures') || [];
    const updatedPictures = currentPictures.filter((_: any, idx: number) => idx !== index);
    form.setFieldsValue({
      pictures: updatedPictures, // อัปเดตฟอร์ม
    });
    setUploadedEditImages(updatedPictures); // อัปเดต state ของรูป
  };

  // ฟังก์ชันเพื่อคำนวณจำนวนรูปที่อัปโหลด
  const getTotalValidImages = () => {
    const pictures = form.getFieldValue('pictures') || [];
    const validImages = pictures.filter((image: string) => image.startsWith('data:image'));
    return validImages.length;
  };

  useEffect(() => {
    // อัปเดตจำนวนรูปเมื่อมีการเพิ่มหรือลบรูป
    setImageCount(getTotalValidImages());
  }, [uploadedEditImages]); // เมื่อ uploadedEditImages เปลี่ยน, อัปเดตจำนวน

  useEffect(() => {
    // เช็คจำนวนรูปเริ่มต้นจากฟอร์ม (กรณีที่มีรูปเริ่มต้นอยู่)
    setImageCount(getTotalValidImages());
  }, []); // เมื่อคอมโพเนนต์โหลด, กำหนดค่าเริ่มต้น


  const handleEditClick = (review: any) => {
    setCurrentReview(review);
    form.setFieldsValue({
      menuNames: review.menuNames.join(' , '),
      reviewType: reviewTypes[review.review_type_id] || 'Unknown',
      reviewText: review.review_text,
      serviceRating: review.service_rating,
      priceRating: review.price_rating,
      tasteRating: review.taste_rating,
      pictures: review.pictures || [],  // Ensure pictures are included in form state
    });
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);  // Close the modal
    setCurrentReview(null);  // Clear the current review data
    setUploadedEditImages([]);  // Reset uploaded images array to an empty array
    form.resetFields();  // Optionally, reset form fields (if needed)
  };


  const handleSubmitEdit = async () => {
    if (!currentReview) {
      message.error('No review selected.');
      return;
    }

    try {
      const values = await form.validateFields();
      const updatedReviewData = {
        ...currentReview,
        review_text: values.reviewText,
        service_rating: values.serviceRating,
        price_rating: values.priceRating,
        taste_rating: values.tasteRating,
        overall_rating: (
          parseFloat(values.priceRating) +
          parseFloat(values.tasteRating) +
          parseFloat(values.serviceRating)
        ) / 3,
        pictures: values.pictures,
      };

      const response = await UpdateReviewById(String(currentReview.ID), updatedReviewData);

      if (response.status === 200) {
        message.success('Review updated successfully!');
        setIsEditModalVisible(false);
        window.location.reload(); // Refresh the page after update
      } else {
        message.error('Failed to update review.');
      }
    } catch (error) {
      message.error('Failed to submit form.');
    }
  };

  const showDeleteReviewModal = (id: string | number) => {
    setDeleteReviewId(id);
    setIsDeleteModalVisible(true);
  };


  const handleDeleteReviewConfirm = async () => {
    try {
      const response = await DeleteReviewById(String(deleteReviewId));
      if (response.status === 200) {
        message.success('Review deleted successfully');
        setReviewedFoodItems((prevItems) =>
          prevItems.filter((item) => item.ID !== deleteReviewId)
        );
      } else {
        message.error('Failed to delete review');
      }
    } catch (error) {
      message.error('An error occurred while deleting the review');
    } finally {
      setIsDeleteModalVisible(false);
      setDeleteReviewId(null);
      window.location.reload(); // Refresh the page
    }
  };

  const handleDeleteReviewCancel = () => {
    setIsDeleteModalVisible(false);
    setDeleteReviewId(null);
  };



  return (
    <div style={{ width: '100%', minHeight: "100vh", background: '#FFFFFF'}}>
      <Navbar />
      <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
        {/* Left Side - Customer Information */}
        <div style={{ flex: '0 0 250px', background: '#003366', borderRadius: '8px', padding: '20px', position: 'fixed', top: '100px', zIndex: 1000 }}>
          {userInfo && (
            <Card title="ประวัติส่วนตัว" bordered={false} style={{ boxShadow: '0 4px 8px rgba(235, 0, 0, 0.1)', textAlign: 'center' }}>
              {userInfo.picture && (
                <img
                  src={userInfo.picture}
                  alt="Profile"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '10px',
                  }}
                />
              )}
              <p><strong>Customer ID:</strong> {userInfo.ID}</p>
              <p><strong>ชื่อ:</strong> {userInfo.first_name}</p>
              <p><strong>นามสกุล:</strong> {userInfo.last_name}</p>
              <p><strong>อายุ:</strong> {userInfo.age}</p>
              <p><strong>อีเมล:</strong> {userInfo.email}</p>
              <p><strong>เบอร์โทร:</strong> {userInfo.phone_number}</p>
            </Card>
          )}
        </div>

        {/* Right Side - Review Section */}
        <div style={{ flex: 1, marginLeft: '270px' }}>
          <Card
            style={{
              background: '#f9f9f9',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'reviewed' | 'notReviewed')}>
              <Tabs.TabPane tab="รีวิวของฉัน" key="reviewed">
                <Tabs defaultActiveKey="foodReview">
                  <Tabs.TabPane tab="Food" key="foodReview">
                    {reviewedFoodItems.map((review) => (
                      <Card
                        key={review.ID}
                        type="inner"
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                            <img
                              src={userInfo.picture}
                              alt="User"
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: '16px' }}>{`${userInfo.first_name} ${userInfo.last_name}`}</p>
                              <p style={{ fontSize: '12px', color: '#888' }}>{userInfo.email}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Rate
                                  allowHalf
                                  disabled
                                  defaultValue={review.overall_rating}
                                  style={{ fontSize: '14px' }}
                                />
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                                  {dayjs(review.review_date).fromNow()}
                                </p>
                              </div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                              <Dropdown
                                overlay={
                                  <Menu>
                                    <Menu.Item onClick={() => handleEditClick(review)}>Edit</Menu.Item>
                                    <Menu.Item onClick={() => showDeleteReviewModal(String(review.ID))}>Delete</Menu.Item>
                                  </Menu>
                                }
                                trigger={['click']}
                              >
                                <Button
                                  icon={<EllipsisOutlined />}
                                  shape="circle"
                                  style={{ border: 'none', background: 'transparent' }}
                                />
                              </Dropdown>
                            </div>
                          </div>
                        }
                        style={{
                          marginBottom: '20px',
                          borderRadius: '10px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          padding: '20px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                          <div style={{ flex: 1 }}>
                            <h2 style={{ marginBottom: '12px', fontSize: '18px' }}>
                              {review.menuNames.join(', ')} (Order #{review.order_id})
                            </h2>
                            <h4 style={{ marginBottom: '16px', fontSize: '15px', color: '#555' }}>
                              {review.review_text}
                            </h4>

                            {/* Taste, Service, and Price Rating Card */}
                            <Card
                              style={{
                                background: '#fff',
                                borderRadius: '10px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                marginTop: '24px',
                                padding: '20px',
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>💼 Service</p>
                                  <Rate allowHalf disabled defaultValue={review.service_rating} style={{ fontSize: '20px', color: '#4CAF50' }} />
                                  <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{review.service_rating} / 5</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>🍴 Taste</p>
                                  <Rate allowHalf disabled defaultValue={review.taste_rating} style={{ fontSize: '20px', color: '#FF5722' }} />
                                  <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{review.taste_rating} / 5</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>💵 Price</p>
                                  <Rate allowHalf disabled defaultValue={review.price_rating} style={{ fontSize: '20px', color: '#FFC107' }} />
                                  <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{review.price_rating} / 5</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#555' }}>🍽️ Recommended Dish</p>
                                  <h1 style={{ margin: '8px 0', fontSize: '14px', color: '#555' }}>
                                    {review.recommended_dishes || 'No recommended dish provided.'}
                                  </h1>
                                </div>
                              </div>
                            </Card>

                            {/* Pictures below the Rating Card */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center', // จัดรูปให้อยู่ตรงกลางในแนวนอน
                                alignItems: 'center', // จัดรูปให้อยู่ตรงกลางในแนวตั้ง (ถ้าสูงกว่าหนึ่งบรรทัด)
                                flexWrap: 'wrap', // รองรับรูปหลายแถว
                                gap: '16px', // เพิ่มระยะห่างระหว่างรูป
                                marginTop: '24px',
                              }}
                            >
                              {review.pictures && review.pictures.length > 0 ? (
                                review.pictures.map((pic, idx) => (
                                  <div key={idx} style={{ width: '120px', height: '120px' }}>
                                    <img
                                      src={pic}
                                      alt={`Review Pic ${idx + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // เพิ่มเงาสำหรับรูป
                                      }}
                                    />
                                  </div>
                                ))
                              ) : (
                                <p style={{ color: '#888', fontSize: '14px', textAlign: 'center' }}>No pictures available.</p>
                              )}
                            </div>

                          </div>
                        </div>
                      </Card>
                    ))}

                    {/* Delete Confirmation Modal */}
                    <Modal
                      title={<h2 style={{ textAlign: 'center', margin: 0 }}>Confirm Delete</h2>}
                      visible={isDeleteModalVisible}
                      onOk={handleDeleteReviewConfirm}
                      onCancel={handleDeleteReviewCancel}
                      okText="Yes, Delete"
                      cancelText="No"
                      centered
                      bodyStyle={{
                        textAlign: 'center',
                        padding: '24px',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                      }}
                      okButtonProps={{
                        danger: true,
                        style: { backgroundColor: '#ff4d4f', border: 'none', fontWeight: 'bold' },
                      }}
                      cancelButtonProps={{
                        style: { backgroundColor: '#d9d9d9', border: 'none', fontWeight: 'bold' },
                      }}
                      width={400}
                    >
                      <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </p>
                      <p style={{ fontSize: '14px', color: 'gray' }}>
                        Please confirm your action below.
                      </p>
                    </Modal>
                  </Tabs.TabPane>
                </Tabs>
              </Tabs.TabPane>


              {/* Tab ยังไม่ได้รีวิว */}
              <Tabs.TabPane tab="ยังไม่ได้รีวิว" key="notReviewed">
                <Tabs defaultActiveKey="foodReview">
                  <Tabs.TabPane tab="Food" key="foodReview">
                    <Card title="Food Review" style={{ marginBottom: '20px' }}>
                      {notReviewedItems.map((order) => (
                        <Card
                          key={order.id}
                          type="inner"
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{`Order #${order.id}`}</span>
                              <span style={{ fontSize: '14px', color: '#888' }}>
                                {`รหัสการชำระเงิน : ${order.paymentID}, ${new Date(order.paymentDate ?? '').toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}`}
                              </span>

                              <Button
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                icon={expandedOrder === order.id ? <UpOutlined /> : <DownOutlined />}
                                style={{ borderRadius: '8px' }}
                              >
                                {expandedOrder === order.id ? 'Show Less' : 'Show More'}
                              </Button>

                            </div>
                          }
                          style={{ marginBottom: '16px' }}
                        >
                          {expandedOrder === order.id ? (
                            <>
                              <p><strong>Status:</strong> {order.status}</p>
                              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                              <div>
                                {(order.menuDetails ?? []).map((detail: { quantity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; menuImage: string | undefined; menuName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; menuPrice: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; amount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ marginRight: '8px' }}>{detail.quantity}x</span>
                                    <img
                                      src={detail.menuImage}
                                      alt={`Menu Image ${Number(index) + 1}`}
                                      style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginRight: '12px',
                                      }}
                                    />
                                    <div>
                                      <p><strong>Menu Name:</strong> {detail.menuName}</p>
                                      <p><strong>Price per unit:</strong> {detail.menuPrice}</p>
                                      <p><strong>Amount:</strong> {detail.amount}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p><strong>Subtotal:</strong> {(order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0)}</p>
                              <p><strong>VAT (7%):</strong> {((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 0.07).toFixed(2)}</p>
                              <p><strong>Total:</strong> {((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07).toFixed(2)}</p>
                              <p><strong>Discount:</strong> {((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07 - (order.totalPrice ?? 0)).toFixed(2) === '0.00' ? '-' : ((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07 - (order.totalPrice ?? 0)).toFixed(2)}</p>
                              <p><strong>Grand Total:</strong> {(order.totalPrice ?? 0).toFixed(2)}</p>
                              <Button type="primary" onClick={() => handleAddReview(order)} style={{ float: 'right' }}>Add Review</Button>
                            </>
                          ) : (
                            <>
                              {(order.menuDetails ?? []).map((detail: { menuImage: string | undefined; menuName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; menuPrice: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                  <img
                                    src={detail.menuImage}
                                    alt={`Menu Image ${Number(index) + 1}`}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      marginRight: '12px',
                                    }}
                                  />
                                  <div>
                                    <p><strong>Menu Name:</strong> {detail.menuName}</p>
                                    <p><strong>Price per unit:</strong> {detail.menuPrice}</p>
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="primary"
                                onClick={() => handleAddReview(order)}
                                style={{ float: 'right', marginTop: '12px' }}
                              >
                                Add Review
                              </Button>
                            </>
                          )}
                        </Card>
                      ))}
                    </Card>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="Trip and Cabin" key="tripReview">
                    {/* Empty Tab for Trip and Cabin Review */}
                  </Tabs.TabPane>
                </Tabs>
              </Tabs.TabPane>
            </Tabs>

            {/* Edit Modal */}
            <Modal
              visible={isEditModalVisible}
              title={
                <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  ✏️ Edit Review
                </div>
              }
              onCancel={handleCancelEdit}
              onOk={handleSubmitEdit}
              okText="Save Changes"
              cancelText="Cancel"
              centered
              width={700}
              bodyStyle={{
                background: 'linear-gradient(135deg, #f0f8ff, #e6e6fa)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                fontFamily: 'Arial, Helvetica, sans-serif',
              }}
              okButtonProps={{
                style: {
                  backgroundColor: '#4CAF50',
                  border: 'none',
                  fontWeight: 'bold',
                  color: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 10px rgba(0, 128, 0, 0.3)',
                },
              }}
              cancelButtonProps={{
                style: {
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #d9d9d9',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                },
              }}
            >
              <Form form={form} layout="vertical">
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        📝 Menu Names
                      </span>
                    }
                    name="menuNames"
                    rules={[{ required: true, message: 'Please enter menu names' }]}
                  >
                    <Input disabled style={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }} />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        📖 Review Type
                      </span>
                    }
                    name="reviewType"
                    rules={[{ required: true, message: 'Please select review type' }]}
                  >
                    <Input disabled style={{ backgroundColor: '#f5f5f5', borderRadius: '8px' }} />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        💬 Review Text
                      </span>
                    }
                    name="reviewText"
                    rules={[{ required: true, message: 'Please enter review text' }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Write your review here..."
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        backgroundColor: '#fefefe',
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        💼 Service Rating
                      </span>
                    }
                    name="serviceRating"
                    rules={[{ required: true, message: 'Please rate the price' }]}
                  >
                    <Rate allowHalf style={{ fontSize: '18px', color: 'yellow' }} />
                  </Form.Item>
                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        💵 Price Rating
                      </span>
                    }
                    name="priceRating"
                    rules={[{ required: true, message: 'Please rate the price' }]}
                  >
                    <Rate allowHalf style={{ fontSize: '18px', color: '#4CAF50' }} />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span style={{ fontWeight: 'bold', color: '#555' }}>
                        🍴 Taste Rating
                      </span>
                    }
                    name="tasteRating"
                    rules={[{ required: true, message: 'Please rate the taste' }]}
                  >
                    <Rate allowHalf style={{ fontSize: '18px', color: 'orange' }} />
                  </Form.Item>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <Form.Item label={<strong>🖼️ Review Images
                    <span
                      style={{
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        color: 'red',
                        border: '1px dashed #ccc',
                        marginLeft: '8px', // เพิ่มช่องว่างระหว่างข้อความและตัวนับ
                      }}
                    >
                      {getTotalValidImages()} / {maxImages}
                    </span>
                  </strong>} name="pictures">
                    <div
                      style={{
                        display: 'flex',
                        gap: '15px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        padding: '10px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* Display Existing Images */}
                      {form.getFieldValue('pictures') &&
                        form.getFieldValue('pictures').length > 0 &&
                        form.getFieldValue('pictures').map((pic: string, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              marginBottom: '10px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #ddd',
                            }}
                          >
                            <AntImage
                              src={pic}
                              alt={`Review Pic ${idx + 1}`}
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                              }}
                            />
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: '#ff4d4f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                              }}
                              onClick={() => handleImageDelete(idx)}
                            />
                          </div>
                        ))}
                      {/* Upload New Image */}
                      <Upload
                        accept="image/*"
                        beforeUpload={handleEditUpload}
                        showUploadList={false}
                        disabled={getTotalValidImages() >= 3} // Disable upload button when 3 images are uploaded
                      >
                        <Button
                          icon={<UploadOutlined />}
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '1px dashed #bbb',
                            backgroundColor: '#f9f9f9',
                            color: '#555',
                            fontSize: '16px',
                            flexDirection: 'column', // Stack the icon and text vertically
                            textAlign: 'center', // Center the text below the icon
                          }}
                        >
                          <div>Upload</div>
                          <div>(Max: 3)</div>
                        </Button>
                      </Upload>
                    </div>
                  </Form.Item>
                </div>
              </Form>
            </Modal>

            <Modal
              title="Add Review"
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              onOk={() => form.submit()}
            >
              <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item name="reviewtype" label="ReviewType">
                  <Input value={currentReview && currentReview.review_type_id !== undefined ? reviewTypes[currentReview.review_type_id] : ''} readOnly />
                </Form.Item>
                <Form.Item name="title" label="Title">
                  <Input readOnly />
                </Form.Item>

                <Form.Item name="menuNames" label="Menu Name">
                  <Input readOnly />
                </Form.Item>
                <Form.Item
                  name="review_text"
                  label="เขียนรีวิว"
                  rules={[{ required: true, message: 'Please enter a Review!' }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="service_rating"
                  label="💼 Service"
                  rules={[{ required: true, message: 'Please provide a Service Rating!' }]}
                >
                  <Rate allowHalf defaultValue={0} tooltips={['Very Bad', 'Bad', 'Average', 'Good', 'Excellent']} />
                </Form.Item>
                <Form.Item
                  name="price_rating"
                  label="💵 Price"
                  rules={[{ required: true, message: 'Please provide a Price Rating!' }]}
                >
                  <Rate allowHalf defaultValue={0} tooltips={['Very Bad', 'Bad', 'Average', 'Good', 'Excellent']} />
                </Form.Item>
                <Form.Item
                  name="taste_rating"
                  label="🍴 Taste"
                  rules={[{ required: true, message: 'Please provide a Taste Rating!' }]}
                >
                  <Rate allowHalf defaultValue={0} tooltips={['Very Bad', 'Bad', 'Average', 'Good', 'Excellent']} />
                </Form.Item>
                <Form.Item
                  name="recommended_dish"
                  label="🍽️ Recommended Dish"
                  rules={[{ required: true, message: 'Please select a Recommended Dish!' }]}
                >
                  <Select placeholder="Select a dish" defaultValue={currentReview?.menuNames?.[0] || 'Unknown'}>
                    {/* Add an option for 'Not Recommended' */}
                    <Select.Option value="Not Recommended">No recommended dish.</Select.Option>

                    {/* Map over the menuNames array to create options */}
                    {currentReview?.menuNames?.map((menuName: string, index: number) => (
                      <Select.Option key={index} value={menuName}>
                        {menuName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="images"
                  label="Upload Images"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                >
                  <Upload
                    name="images"
                    listType="picture"
                    maxCount={3}
                    multiple
                    beforeUpload={handleCreateImageUpload}
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload (Max: 3)</Button>
                  </Upload>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewForCustomer;
