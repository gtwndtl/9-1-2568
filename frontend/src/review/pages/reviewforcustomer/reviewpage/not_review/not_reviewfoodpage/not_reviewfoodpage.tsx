import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, message, Modal, Rate, Row, Select, } from "antd";
import { CreateReview, GetReviews, GetReviewTypes } from "../../../../../service/ReviewAPI";
import { ReviewInterface } from "../../../../../interface/Review";
import { GetMenu } from "../../../../../../food_service/service/https/MenuAPI";
import { GetOrderDetail } from "../../../../../../food_service/service/https/OrderDetailAPI";
import { DownOutlined, UploadOutlined, UpOutlined } from "@ant-design/icons";
import Upload from "antd/es/upload";
import { GetFoodServicePayment } from "../../../../../../payment/service/https/FoodServicePaymentAPI";
import { GetOrder } from "../../../../../../food_service/service/https/OrderAPI";
import "./not_reviewfoodpage.css";
import SpinnerReview from "../../../reviewspinner/spinner_review";

const customerID = Number(localStorage.getItem('id'));

export default function NotReviewedTripPage() {
    const [notReviewedFoodItems, setNotReviewedFoodItems] = useState<ReviewInterface[]>([]);
    const [isNotReviewedLoaded, setIsNotReviewedLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [currentReview, setCurrentReview] = useState<ReviewInterface | null>(null);
    const [reviewTypes, setReviewTypes] = useState<Record<number, string>>({});
    const [base64CreateImages, setBase64CreateImages] = useState<string[]>([]);
    const [, setImageCount] = useState<number>(0); // เก็บจำนวนรูปที่อัปโหลด
    const [dateFilter, setDateFilter] = useState<string | null>(null);
    const [filteredReviews, setFilteredReviews] = useState<ReviewInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true); // State for loader


    // Fetch Not Reviewed Items
    useEffect(() => {
        const fetchNotReviewedItems = async () => {
            if (!isNotReviewedLoaded) {
                try {
                    setIsLoading(true); // Show loader

                    const fetchData = new Promise<void>(async (resolve) => {
                        const reviewResponse = await GetReviews();
                        if (reviewResponse.status !== 200) throw new Error("Failed to fetch reviews.");
                        const allReviews = reviewResponse.data;
                        const allReviewsFood = allReviews.filter(
                            (review: { review_type_id: any }) => review.review_type_id === 2
                        );

                        // Get IDs of reviewed orders
                        const reviewedOrderIds = allReviewsFood.map((review: { order_id: any }) => review.order_id);

                        const ordersResponse = await GetOrder();
                        if (ordersResponse.status !== 200) throw new Error("Failed to fetch orders.");
                        const allOrders = ordersResponse.data;

                        // Filter orders of the current customer with "paid" status
                        const customerOrders = allOrders.filter(
                            (orders: any) => orders.CustomerID === customerID && orders.StatusID === 5
                        );

                        // Filter orders that haven't been reviewed
                        const notReviewedOrders = customerOrders.filter(
                            (order: any) => !reviewedOrderIds.includes(order.ID)
                        );

                        const ordersDetailsResponse = await GetOrderDetail();
                        if (ordersDetailsResponse.status !== 200) throw new Error("Failed to fetch order details.");
                        const allOrderDetails = ordersDetailsResponse.data;

                        const menuResponse = await GetMenu();
                        if (menuResponse.status !== 200) throw new Error("Failed to fetch menu details.");
                        const allMenus = menuResponse.data;

                        const foodpaymentResponse = await GetFoodServicePayment();
                        if (foodpaymentResponse.status !== 200) throw new Error("Failed to fetch food service payments.");
                        const allFoodPayment = foodpaymentResponse.data;

                        // Create mappings for menu properties
                        const menuMap = allMenus.reduce((acc: Record<number, string>, menu: any) => {
                            acc[menu.ID] = menu.MenuName;
                            return acc;
                        }, {});
                        const menuPriceMap = allMenus.reduce((acc: Record<number, number>, menu: any) => {
                            acc[menu.ID] = menu.Price;
                            return acc;
                        }, {});
                        const menuImage = allMenus.reduce((acc: Record<number, string>, menu: any) => {
                            acc[menu.ID] = menu.ImageMenu;
                            return acc;
                        }, {});

                        // Enrich orders with additional details
                        const enrichedOrders = notReviewedOrders.map((order: any) => {
                            const relatedDetails = allOrderDetails.filter(
                                (detail: any) => detail.OrderID === order.ID
                            );
                            const payment = allFoodPayment.find((p: any) => p.OrderID === order.ID);

                            return {
                                id: order.ID,
                                review_type_id: 2,
                                orderID: `Order #${order.ID}`,
                                menuDetails: relatedDetails.map((detail: any) => ({
                                    menuName: menuMap[detail.MenuID] || "Unknown",
                                    quantity: detail.Quantity || 0,
                                    amount: detail.Amount || 0,
                                    menuPrice: menuPriceMap[detail.MenuID] || "Unknown",
                                    menuImage: menuImage[detail.MenuID] || "Unknown",
                                })),
                                totalPrice: payment ? payment.Price : "Unknown",
                                paymentDate: payment ? payment.PaymentDate : "Unknown",
                                paymentID: payment ? payment.ID : "Unknown",
                                paymentMethod: payment ? payment.PaymentMethod : "Unknown",
                            };
                        });

                        setNotReviewedFoodItems(enrichedOrders);
                        setIsNotReviewedLoaded(true);
                        resolve(); // Mark fetching as complete
                    });

                    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1000)); // Enforce 3-second delay

                    await Promise.all([fetchData, minimumDelay]); // Wait for both fetching and delay
                    setIsLoading(false); // Hide loader
                } catch (error) {
                    console.error("Error fetching not reviewed items:", error);
                    setIsLoading(false); // Hide loader even if there's an error
                }
            }
        };

        fetchNotReviewedItems();
    }, [isNotReviewedLoaded]);
    useEffect(() => {
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
            orderID: order.orderID,
            menuNames: menuNames.join(' , '),
            recommended_dish: menuNames[0] || 'Unknown', // Set the first menuName as default
        });

        setIsModalOpen(true); // Open the modal
    };
    const onFinish = async (values: any) => {
        if (currentReview) {
            const overallRating = (Number(values.service_rating) + Number(values.value_for_money_rating) + Number(values.taste_rating)) / 3;
            const newReview = {
                ...values,
                review_date: new Date(),
                review_text: values.review_text,
                service_rating: values.service_rating,
                value_for_money_rating: values.value_for_money_rating,
                taste_rating: values.taste_rating,
                overall_rating: overallRating, // Dynamically calculate the overall rating
                recommended_dishes: values.recommended_dishes,
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
                    window.location.href = "/customer/review";
                }, 2000);
            } else {
                message.open({
                    type: "error",
                    content: res.data.error || "ไม่สามารถสร้างรีวิวได้!",
                });
            }
            setNotReviewedFoodItems(notReviewedFoodItems.filter((item) => item.ID !== currentReview.ID));
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

    // ฟังก์ชันเพื่อคำนวณจำนวนรูปที่อัปโหลด
    const getTotalValidImages = () => {
        const pictures = form.getFieldValue('pictures') || [];
        const validImages = pictures.filter((image: string) => image.startsWith('data:image'));
        return validImages.length;
    };
    useEffect(() => {
        // เช็คจำนวนรูปเริ่มต้นจากฟอร์ม (กรณีที่มีรูปเริ่มต้นอยู่)
        setImageCount(getTotalValidImages());
    }, []); // เมื่อคอมโพเนนต์โหลด, กำหนดค่าเริ่มต้น

    // Update filtered reviews when filters change
    useEffect(() => {
        let filtered = [...notReviewedFoodItems];

        if (dateFilter === "asc") {
            filtered.sort((a, b) =>
                new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
            );
        } else if (dateFilter === "desc") {
            filtered.sort((a, b) =>
                new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            );
        }

        setFilteredReviews(filtered);
    }, [dateFilter, notReviewedFoodItems]);


    // Handle filter clearing
    const clearFilters = () => {
        setDateFilter(null);
        setFilteredReviews(notReviewedFoodItems);
    };
    const [serviceRating, setServiceRating] = useState<number | undefined>(undefined);
    const [tasteRating, setTasteRating] = useState<number | undefined>(undefined);
    const [valueForMoneyRating, setValueForMoneyRating] = useState<number | undefined>(undefined);
    
    
    return (
        <section className="not-reviewed-food-page" id="reviewed-food-page">
            {isLoading ? (
                <SpinnerReview />
            ) : (
                <Card
                    style={{
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Filter Controls */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "12px",
                            marginBottom: "24px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>📅 Date:</span>
                            <Select
                                value={dateFilter}
                                onChange={setDateFilter}
                                style={{ width: 160, fontSize: "14px", borderRadius: "8px" }}
                                placeholder="All"
                            >
                                <Select.Option value="asc">Oldest First</Select.Option>
                                <Select.Option value="desc">Newest First</Select.Option>
                            </Select>
                        </div>
                        <Button onClick={clearFilters} type="link" style={{ fontSize: "14px", color: "#007AFF" }}>
                            Clear Filters
                        </Button>
                    </div>

                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((order) => (
                            <Card
                                key={order.id}
                                type="inner"
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                        <span style={{ flex: 1, textAlign: 'left' }}>{`Order #${order.id}`}</span>
                                        <span style={{ flex: 1, textAlign: 'center', fontSize: '14px', color: '#888' }}>
                                            {`รหัสการชำระเงิน : ${order.paymentID}, ${new Date(order.paymentDate ?? '').toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}`}
                                        </span>
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                icon={expandedOrder === order.id ? <UpOutlined /> : <DownOutlined />}
                                                style={{
                                                    borderRadius: '10px',
                                                    width: '120px',
                                                    height: '40px',
                                                    padding: '0 16px',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {expandedOrder === order.id ? 'Show Less' : 'Show More'}
                                            </Button>
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
                                {expandedOrder === order.id ? (
                                    <>
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
                                        <p><strong>Subtotal:</strong> {(order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p><strong>VAT (7%):</strong> {((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p><strong>Total:</strong> {((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p><strong>Discount:</strong> {
                                            ((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07 - (order.totalPrice ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) === '0.00'
                                                ? '-'
                                                : ((order.menuDetails ?? []).reduce((acc: number, detail: any) => acc + detail.amount, 0) * 1.07 - (order.totalPrice ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        }</p>
                                        <p><strong>Grand Total:</strong> {(order.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <Button type="primary" onClick={() => handleAddReview(order)}
                                            style={{
                                                float: 'right',
                                                marginTop: '12px',
                                                backgroundColor: '#133e87',
                                                borderRadius: '10px',
                                                borderColor: '#133e87',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                            }}>Add Review</Button>
                                    </>
                                ) : (
                                    <>
                                        {(order.menuDetails ?? []).map((detail: { menuImage: string; menuName: string; menuPrice: number }, index: React.Key | null | undefined) => (
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
                                            style={{
                                                float: 'right',
                                                marginTop: '12px',
                                                backgroundColor: '#133e87',
                                                borderRadius: '10px',
                                                borderColor: '#133e87',
                                                color: '#fff',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Add Review
                                        </Button>
                                    </>
                                )}
                            </Card>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#555', fontSize: '16px' }}>
                            <p style={{ marginBottom: '16px' }}>You don't have any orders right now. Start ordering your favorite meals!</p>
                            <button
                                className="button_booking_trip"
                                onClick={() => window.location.href = '/food-service/login/menu/order'} // Update with the actual trip planning page URL
                            >
                                <span className="button_booking_trip_lg">
                                    <span className="button_booking_trip_sl"></span>
                                    <span className="button_booking_trip_text">Order Now</span>
                                </span>
                            </button>
                        </div>
                    )}
                </Card>
            )}
            <Modal
                title={
                    <div style={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>Add Review</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                width={800} // ปรับความกว้างของ Modal
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setIsModalOpen(false)}
                        style={{
                            borderRadius: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        style={{
                            backgroundColor: '#133e87',
                            borderRadius: '10px',
                            borderColor: '#133e87',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        Submit
                    </Button>,
                ]}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Row gutter={16}> {/* ใช้ Grid layout */}
                        <Col span={12}>
                            <Form.Item name="reviewtype" label={<span style={{ fontWeight: 'bold', color: '#555' }}>📖 Review Type</span>}>
                                <Input value={currentReview && currentReview.review_type_id !== undefined ? reviewTypes[currentReview.review_type_id] : ''} readOnly />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="orderID" label="Order">
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="menuNames" label={<span style={{ fontWeight: 'bold', color: '#555' }}>📝 Menu Names</span>}>
                                <Input readOnly />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="review_text"
                                label={<span style={{ fontWeight: 'bold', color: '#555' }}>💬 Review Text</span>}
                                rules={[{ required: true, message: 'Please enter a Review!' }]}
                            >
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="service_rating"
                                label="💼 Service"
                                rules={[{ required: true, message: 'Please provide a Service Rating!' }]}
                            >
                                <Rate
                                    allowHalf
                                    style={{ fontSize: '18px', color: '#4CAF50' }}
                                    value={serviceRating} // ค่าที่ควบคุมได้
                                    onChange={(value) => setServiceRating(value)} // อัปเดตค่าเมื่อมีการเปลี่ยนแปลง
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="taste_rating"
                                label="🍴 Taste"
                                rules={[{ required: true, message: 'Please provide a Taste Rating!' }]}
                            >
                                <Rate
                                    allowHalf
                                    style={{ fontSize: '18px', color: '#FF5722' }}
                                    value={tasteRating}
                                    onChange={(value) => setTasteRating(value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="value_for_money_rating"
                                label="💵 Value for Money"
                                rules={[{ required: true, message: 'Please provide a Value for Money Rating!' }]}
                            >
                                <Rate
                                    allowHalf
                                    style={{ fontSize: '18px', color: '#FFC107' }}
                                    value={valueForMoneyRating}
                                    onChange={(value) => setValueForMoneyRating(value)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="recommended_dishes"
                                label="🍽️ Recommended Dishes"
                                rules={[{ required: true, message: 'Please select a Recommended Dish!' }]}
                            >
                                <Select
                                    placeholder="Select a dish"
                                >
                                    <Select.Option value="Not Recommended">Not Recommended</Select.Option>
                                    {currentReview?.menuNames?.map((menuName: string, index: number) => (
                                        <Select.Option key={index} value={menuName}>
                                            {menuName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="images"
                                label="🖼️ Upload Images"
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
                        </Col>
                    </Row>
                </Form>
            </Modal>

        </section>
    );
}
