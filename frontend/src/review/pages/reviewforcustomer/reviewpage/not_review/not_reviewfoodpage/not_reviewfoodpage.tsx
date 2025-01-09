import { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Modal, Rate, Select, } from "antd";
import { CreateReview, GetReviews, GetReviewTypes } from "../../../../../service/ReviewAPI";
import { ReviewInterface } from "../../../../../interface/Review";
import { GetMenu } from "../../../../../../food_service/service/https/MenuAPI";
import { GetOrderDetail } from "../../../../../../food_service/service/https/OrderDetailAPI";
import { DownOutlined, UploadOutlined, UpOutlined } from "@ant-design/icons";
import Upload from "antd/es/upload";
import { FoodServicePaymentInterface } from "../../../../../../payment/interface/IFoodServicePayment";
import { MenuInterface } from "../../../../../../food_service/interface/IMenu";
import { GetFoodServicePayment } from "../../../../../../payment/service/https/FoodServicePaymentAPI";
import { GetOrder } from "../../../../../../food_service/service/https/OrderAPI";

const customerID = Number(localStorage.getItem('id'));

export default function NotReviewedFoodPage() {
    const [notReviewedItems, setNotReviewedItems] = useState<ReviewInterface[]>([]);
    const [isNotReviewedLoaded, setIsNotReviewedLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [currentReview, setCurrentReview] = useState<ReviewInterface | null>(null);
    const [reviewTypes, setReviewTypes] = useState<Record<number, string>>({});
    const [base64CreateImages, setBase64CreateImages] = useState<string[]>([]);
    const [, setImageCount] = useState<number>(0); // เก็บจำนวนรูปที่อัปโหลด



    // Fetch Not Reviewed Items
    useEffect(() => {
        const fetchNotReviewedItems = async () => {
            if (!isNotReviewedLoaded) {
                try {

                    const reviewResponse = await GetReviews();
                    if (reviewResponse.status !== 200) throw new Error('Failed to fetch reviews.');
                    const allReviews = reviewResponse.data;

                    // ดึง ID ของ Order ที่มีการรีวิวแล้ว
                    const reviewedOrderIds = allReviews.map((review: { order_id: any; }) => review.order_id);

                    const ordersResponse = await GetOrder();
                    if (ordersResponse.status !== 200) throw new Error('Failed to fetch orders.');
                    const allOrders = ordersResponse.data;

                    // กรองเฉพาะ Orders ของ Customer ID ที่มีสถานะเป็น "paid"
                    const customerOrders = allOrders.filter(
                        (orders: any) => orders.CustomerID === customerID && orders.Status === "Paid"
                    );

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
                Recommended_dishes: values.recommended_dishes,
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
                    window.location.href = "/reviewforcustomer/fullcontent";
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


    return (
        <section className="reviewed-page" id="reviewed-page">
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
                        name="recommended_dishes"
                        label="🍽️ Recommended Dishes"
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


        </section>
    );
}
