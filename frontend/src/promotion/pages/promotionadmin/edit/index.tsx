import { useState, useEffect } from "react";
import { Space, Button, Col, Row, Divider, Form, Input, Card, message, DatePicker, Select, InputNumber, Typography, } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { GetPromotionById, UpdatePromotionById, GetPromotionType, GetDiscountType, GetPromotionStatus } from "../../../service/htpps/PromotionAPI";
import { useNavigate, Link, useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import Navbar from "../../../../adminpage/navbar";
import "./index.css";
import LoaderAdmin from "../../../../adminpage/loaderadmin";

function PromotionEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const [promotionTypes, setPromotionTypes] = useState<{ ID: number; type: string }[]>([]);
  const [discountTypes, setDiscountTypes] = useState<{ ID: number; discount_type: string }[]>([]);
  const [statusTypes, setStatusTypes] = useState<{ ID: number; status: string }[]>([]);
  const [selectedDiscountType, setSelectedDiscountType] = useState<number | null>(null); // State สำหรับประเภทส่วนลด
  const [showLimitDiscount, setShowLimitDiscount] = useState(true); // State สำหรับการควบคุมการแสดง limit_discount
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(true);
  const [, setStartDate] = useState<Dayjs | null>(null);
  const { Text } = Typography;

  const getPromotionById = async (id: string) => {
    setLoading(true); // เริ่มโหลดข้อมูล
    let res = await GetPromotionById(id);
    if (res.status === 200) {
      form.setFieldsValue({
        name: res.data.name,
        code: res.data.code,
        details: res.data.details,
        start_date: dayjs(res.data.start_date),
        end_date: dayjs(res.data.end_date),
        limit: res.data.limit,
        count_limit: res.data.count_limit,
        discount: res.data.discount,
        minimum_price: res.data.minimum_price,
        limit_discount: res.data.limit_discount,
        type_id: res.data.type_id,
        discount_id: res.data.discount_id,
        status_id: res.data.status_id,
      });

      setSelectedDiscountType(res.data.discount_id);
      // ตั้งค่า showLimitDiscount ตามค่า discount_id
      setShowLimitDiscount(res.data.discount_id !== 2); // ถ้า discount_id = 2 ให้ซ่อน limit_discount
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลโปรโมชั่น",
      });
      setTimeout(() => {
        navigate("/admin/promotion");
      }, 2000);
    }
    setLoading(false); // ข้อมูลโหลดเสร็จ
  };

  const getPromotionTypes = async () => {
    let res = await GetPromotionType();
    if (res.status === 200) {
      setPromotionTypes(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลประเภทโปรโมชั่นได้",
      });
    }
  };

  const getDiscountTypes = async () => {
    let res = await GetDiscountType();
    if (res.status === 200) {
      setDiscountTypes(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลประเภทส่วนลดได้",
      });
    }
  };

  const getStatusTypes = async () => {
    let res = await GetPromotionStatus();
    if (res.status === 200) {
      setStatusTypes(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่สามารถโหลดข้อมูลประเภทโปรโมชั่นได้",
      });
    }
  };

  const onFinish = async (values: any) => {
    let payload = {
      ...values,
      discount: parseFloat(values.discount),
      limit_discount: parseFloat(values.limit_discount),
      limit: parseInt(values.limit),
      count_limit: parseInt(values.count_limit),
      minimum_price: parseFloat(values.minimum_price),
    };

    const res = await UpdatePromotionById(String(id), payload);
    if (res.status === 200) {
      messageApi.open({
        type: "success",
        content: "อัพเดทสำเร็จ!",
      });
      setTimeout(() => {
        navigate("/admin/promotion");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: "อัพเดทไม่สำเร็จ!",
      });
    }
  };

  useEffect(() => {
    getPromotionTypes();
    getDiscountTypes();
    getStatusTypes();
    getPromotionById(String(id));
  }, [id]);

  return (
    <div className="promotion-admin-edit-page"><Navbar />
      {contextHolder}
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <LoaderAdmin />
        </div>
      ) : (
        <div className="edit-promotion-page">
          <Card className="card-edit-promotion">
            <h2>แก้ไขข้อมูลโปรโมชั่น</h2>
            <Divider />
            <Form
              name="promotion-edit"
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item
                    label="ชื่อโปรโมชั่น"
                    name="name"
                    style={{ marginBottom: "16px" }}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>รหัสโปรโมชั่น</Text>}
                    name="code"
                    rules={[
                      { required: true, message: "กรุณากรอกรายละเอียด!" },
                      {
                        pattern: /^[A-Za-z0-9]{1,10}$/, // ตัวอักษรภาษาอังกฤษหรือตัวเลข ไม่เกิน 10 ตัว
                        message: "กรุณากรอกเฉพาะตัวอักษรภาษาอังกฤษหรือตัวเลข ไม่เกิน 10 ตัว!",
                      },
                    ]}
                  >
                    <Input
                      onChange={(e) => {
                        const { value } = e.target;
                        form.setFieldsValue({ code: value.toUpperCase() }); // แปลงค่าเป็นตัวพิมพ์ใหญ่
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="รายละเอียด"
                    name="details"
                    rules={[{ required: true, message: "กรุณากรอกรายละเอียด!" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input.TextArea />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>วันที่เริ่มต้น</Text>}
                    name="start_date"
                    rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มต้น!" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY MMMM DD" // กำหนดรูปแบบการแสดงผล
                      disabledDate={(current) =>
                        current && current.isBefore(dayjs().startOf("day")) // ปิดวันที่ก่อนวันนี้
                      }
                      onChange={(date) => {
                        setStartDate(date); // เก็บค่าของวันที่เริ่มต้น
                        form.setFieldsValue({ end_date: null }); // รีเซ็ต end_date
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>วันที่สิ้นสุด</Text>}
                    name="end_date"
                    rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด!" }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY MMMM DD" // กำหนดรูปแบบการแสดงผล
                      disabledDate={(current) => {
                        const startDate = form.getFieldValue("start_date"); // ดึงค่า start_date จากฟอร์ม
                        if (!startDate) {
                          return current && current.isBefore(dayjs().startOf("day")); // ปิดวันที่ก่อนวันนี้ ถ้ายังไม่มีค่า start_date
                        }

                        const isStartDateToday = dayjs(startDate).isSame(dayjs(), "day"); // เช็คว่า start_date คือวันนี้หรือไม่

                        return (
                          current &&
                          (current.isBefore(dayjs().startOf("day")) || // ปิดวันที่ก่อนวันนี้
                            current.isSameOrBefore(startDate) || // ปิดวันที่ก่อนหรือเท่ากับ start_date
                            (isStartDateToday && current.isSame(dayjs(), "day"))) // ปิดวันที่วันนี้ ถ้า start_date คือวันนี้
                        );
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="ประเภทโปรโมชั่น"
                    name="type_id"
                    rules={[{ required: true, message: "กรุณาเลือกประเภทโปรโมชั่น!" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Select style={{ width: "100%" }}>
                      {promotionTypes.map((promotion_type) => (
                        <Select.Option key={promotion_type.ID} value={promotion_type.ID}>
                          {promotion_type.type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="ประเภทส่วนลด"
                    name="discount_id"
                    rules={[{ required: true, message: "กรุณาเลือกประเภทส่วนลด!" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Select style={{ width: "100%" }} disabled>
                      {discountTypes.map((discount_type) => (
                        <Select.Option key={discount_type.ID} value={discount_type.ID}>
                          {discount_type.discount_type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`ส่วนลด (${selectedDiscountType === 1 ? "%" : "฿"})`} // เปลี่ยน label ตามเงื่อนไข
                    name="discount"
                    rules={[
                      { required: true, message: "กรุณากรอกส่วนลด!" }, // กำหนด required
                      {
                        pattern: /^[0-9]+$/, // ตรวจสอบว่ากรอกเฉพาะตัวเลข
                        message: "กรุณากรอกเฉพาะตัวเลข!",
                      },
                      {
                        validator: (_, value) => {
                          if (selectedDiscountType === 1) {
                            // กรณีเป็นเปอร์เซ็นต์
                            if (!value || value < 1 || value > 100) {
                              return Promise.reject(new Error("ส่วนลดต้องอยู่ระหว่าง 1 ถึง 100!"));
                            }
                          } else {
                            // กรณีเป็นจำนวนเงิน
                            if (!value || value <= 0) {
                              return Promise.reject(new Error("กรุณากรอกจำนวนเงินที่มากกว่า 0!"));
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input
                      addonAfter={selectedDiscountType === 1 ? "%" : "฿"} // เพิ่ม addonAfter
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>


                <Col span={12} style={{ display: showLimitDiscount ? "block" : "none" }}>
                  <Form.Item
                    label={<Text strong>ส่วนลดสูงสุด</Text>}
                    name="limit_discount"
                    rules={[
                      {
                        required: true,
                        message: "กรุณากรอกส่วนลดสูงสุด!",
                      },
                      {
                        pattern: /^[0-9]*$/,
                        message: "กรุณากรอกเฉพาะตัวเลข!",
                      },
                    ]}
                  >
                    <Input addonAfter="฿" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>จำนวนสิทธิ์</Text>}
                    name="limit"
                    rules={[
                      { required: true, message: "กรุณากรอกจำนวนสิทธิ์!" },
                      {
                        pattern: /^[1-9][0-9]*$/,
                        message: "กรุณากรอกเฉพาะตัวเลขที่มากกว่าหรือเท่ากับ 1!",
                      },
                    ]}
                  >
                    <Input addonAfter="ครั้ง" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="จำนวนการใช้"
                    name="count_limit"
                    rules={[{ required: true, message: "กรุณากรอกจำนวนการใช้!" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Input readOnly addonAfter="ครั้ง" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<Text strong>ราคาขั้นต่ำ</Text>}
                    name="minimum_price"
                    rules={[
                      { required: true, message: "กรุณากรอกราคาขั้นต่ำ!" },
                      {
                        pattern: /^[1-9][0-9]*$/,
                        message: "กรุณากรอกเฉพาะตัวเลขที่มากกว่าหรือเท่ากับ 1!",
                      },
                    ]}
                  >
                    <Input addonAfter="฿" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="สถานะ"
                    name="status_id"
                    rules={[{ required: true, message: "กรุณาเลือกสถานะ!" }]}
                    style={{ marginBottom: "16px" }}
                  >
                    <Select style={{ width: "100%" }}>
                      {statusTypes.map((status) => (
                        <Select.Option key={status.ID} value={status.ID}>
                          {status.status}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="end" style={{ marginTop: "16px" }}>
                <Space> {/* ใช้ Space กำหนดระยะห่างระหว่างปุ่ม */}
                  <Link to="/admin/promotion">
                    <Button
                      type="default"
                      style={{
                        backgroundColor: "#f0f0f0",
                        borderRadius: "8px",
                        padding: "0 24px",
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                    style={{
                      backgroundColor: "#003366",
                      borderRadius: "8px",
                      padding: "0 24px",
                    }}
                  >
                    อัพเดท
                  </Button>
                </Space>
              </Row>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PromotionEdit;
