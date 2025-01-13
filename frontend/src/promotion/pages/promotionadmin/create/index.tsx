import {
  Space,
  Button,
  Col,
  Row,
  Divider,
  Form,
  Input,
  Card,
  message,
  DatePicker,
  InputNumber,
  Spin,
  Typography,
  Select,
  Steps,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePromotion, GetPromotionType, GetDiscountType } from "../../../service/htpps/PromotionAPI";
import { PromotionTypeInterface } from "../../../interface/Promotion_type";
import { DiscountTypeInterface } from "../../../interface/Discount_type";
import Navbar from "../../../../adminpage/navbar";
import type { Dayjs } from "dayjs"; // นำเข้าประเภท Dayjs จาก dayjs
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "./index.css";

dayjs.extend(isSameOrBefore); // เพิ่มปลั๊กอินลงใน Dayjs

const { Title, Text } = Typography;
const { Step } = Steps;

function PromotionCreate() {
  const navigate = useNavigate();
  const [promotionTypes, setPromotionTypes] = useState<PromotionTypeInterface[]>([]);
  const [discountTypes, setDiscountTypes] = useState<DiscountTypeInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedType, setSelectedType] = useState<PromotionTypeInterface | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [startDate, setStartDate] = useState<Dayjs | null>(null); // กำหนดประเภทเป็น Dayjs หรือ null
  const [currentStep, setCurrentStep] = useState(0); // สำหรับการติดตามขั้นตอน

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promotionResponse, discountResponse] = await Promise.all([GetPromotionType(), GetDiscountType()]);

        if (promotionResponse.status === 200) {
          setPromotionTypes(promotionResponse.data);
        } else {
          message.error("ไม่สามารถโหลดประเภทโปรโมชั่นได้!");
        }

        if (discountResponse.status === 200) {
          setDiscountTypes(discountResponse.data);
        } else {
          message.error("ไม่สามารถโหลดประเภทส่วนลดได้!");
        }
      } catch (error) {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSelectType = (type: PromotionTypeInterface) => {
    setSelectedType(type);
    setCurrentStep(1); // ไปยังขั้นตอนที่ 2
  };

  const onFinish = async (values: any) => {
    const formattedValues = {
      ...values,
      type_id: selectedType?.ID,
      discount_id: values.discount_id,
      status_id: 1,
      count_limit: 0,
      discount: parseFloat(values.discount),
      minimum_price: parseFloat(values.minimum_price),
      limit_discount: parseFloat(values.limit_discount),
      limit: Number(values.limit),
    };

    try {
      const res = await CreatePromotion(formattedValues);
      if (res.status === 201) {
        messageApi.open({
          type: "success",
          className: "message-success",
          content: "สร้างโปรโมชั่นสำเร็จ!",
        });
        setTimeout(() => {
          navigate("/admin/promotion");
        }, 2000);
      } else {
        messageApi.open({
          type: "error",
          content: res.data.error || "ไม่สามารถสร้างโปรโมชั่นได้!",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการสร้างโปรโมชั่น!",
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Centers horizontally
          alignItems: "center", // Centers vertically
          minHeight: "90vh", // Use min-height instead of 100vh to give some padding above and below
          width: "100%", // Takes full width
          padding: "20px",
        }}
      >
        {contextHolder}
        <Card
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            background: "#f8f9fa",
            maxWidth: "55%", // Card width set to 55% of the container
          }}
        >
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            size="small"
            style={{ marginBottom: 20 }}
          >
            <Step
              title={<span style={{ fontWeight: 'bold', color: '#003366' }}>เลือกประเภทโปรโมชั่น</span>}
            />
            <Step
              title={
                <span
                  style={{
                    fontWeight: 'bold',
                    color: currentStep === 1 ? '#003366' : '#999',
                    transition: 'color 0.3s ease',
                  }}
                >
                  กรอกข้อมูลโปรโมชั่น
                </span>
              }
              disabled={!selectedType}
            />
          </Steps>
          {currentStep === 0 ? (
            <>
              <Divider />
              <Row gutter={[16, 16]} justify="center" style={{ marginTop: '50px', marginBottom: '50px' }}>
                {promotionTypes.map((type) => (
                  <Col key={type.ID} xs={24} sm={12} md={8}>
                    <Button className="type-button" block onClick={() => onSelectType(type)}>{type.type}</Button>
                  </Col>
                ))}
              </Row>
              <Row justify="center" style={{ marginTop: "20px" }}>
                <Button
                  style={{
                    borderRadius: "8px", background: "#f0f0f0", color: "#666", border: "none"
                  }}
                  onClick={() => navigate("/admin/promotion")}
                >
                  ยกเลิก
                </Button>
              </Row>
            </>
          ) : (
            <>
              <Divider />
              <Form
                form={form}
                name="promotion_create"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24} md={12}>
                    <Form.Item
                      label={<Text strong>ชื่อโปรโมชั่น</Text>}
                      name="name"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12}>
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
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24}>
                    <Form.Item
                      label={<Text strong>รายละเอียด</Text>}
                      name="details"
                      rules={[{ required: true, message: "กรุณากรอกรายละเอียด!" }]}
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={6}>
                    <Form.Item
                      label={<Text strong>วันที่เริ่มต้น</Text>}
                      name="start_date"
                      rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มต้น!" }]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        disabledDate={(current) => current && current.isBefore(dayjs().startOf("day"))}
                        onChange={(date) => {
                          setStartDate(date);
                          form.setFieldsValue({ end_date: null });
                        }}
                      />
                    </Form.Item>
                  </Col>

                  {/* วันที่สิ้นสุด */}
                  <Col xs={24} sm={24} md={6}>
                    <Form.Item
                      label={<Text strong>วันที่สิ้นสุด</Text>}
                      name="end_date"
                      rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด!" }]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        disabledDate={(current) => {
                          if (!startDate) {
                            return current && current.isBefore(dayjs().startOf("day"));
                          }
                          return current && (current.isBefore(dayjs().startOf("day")) || current.isSameOrBefore(startDate));
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12}>
                    <Form.Item
                      label={<Text strong>ประเภทส่วนลด</Text>}
                      name="discount_id"
                      rules={[{ required: true, message: "กรุณาเลือกประเภทส่วนลด!" }]}
                    >
                      <Select defaultValue="กรุณาเลือกประเภทส่วนลด" style={{ width: "100%" }}>
                        {discountTypes?.map((item) => (
                          <Select.Option value={item?.ID} key={item?.ID}>
                            {item?.discount_type}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.discount_id !== currentValues.discount_id}
                  >
                    {({ getFieldValue }) => {
                      const isDiscountSelected = !!getFieldValue("discount_id");
                      const selectedDiscountType = discountTypes.find(
                        (d) => d.ID === getFieldValue("discount_id")
                      );

                      return isDiscountSelected ? (
                        <>
                          {selectedDiscountType?.discount_type === "เปอร์เซ็นต์" ? (
                            <>
                              <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                  label={<Text strong>ส่วนลด (เปอร์เซ็นต์)</Text>}
                                  name="discount"
                                  rules={[{ required: true, message: "กรุณากรอกส่วนลด!" }]}
                                >
                                  <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                                </Form.Item>
                              </Col>
                              <Col xs={24} sm={24} md={12}>
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
                            </>
                          ) : (
                            <Col xs={24} sm={24} md={12}>
                              <Form.Item
                                label={<Text strong>ส่วนลด (จำนวนเงิน)</Text>}
                                name="discount"
                                rules={[
                                  { required: true, message: "กรุณากรอกส่วนลด!" },
                                  { pattern: /^[0-9]*$/, message: "กรุณากรอกเฉพาะตัวเลข!" },
                                ]}
                              >
                                <Input addonAfter="฿" />
                              </Form.Item>
                            </Col>
                          )}
                          <Col xs={24} sm={24} md={12}>
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
                          <Col xs={24} sm={24} md={12}>
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
                        </>
                      ) : null;
                    }}
                  </Form.Item>
                </Row>
                <Row justify="center" style={{ marginTop: "20px" }}>
                  <Space>
                    <Button
                      type="default"
                      style={{
                        backgroundColor: "#f0f0f0",
                        borderRadius: "8px",
                      }}
                      onClick={() => {
                        setCurrentStep(0); // Reset to step 1
                        setSelectedType(null); // Reset selectedType when going back
                        form.resetFields(); // Reset form fields
                      }}
                    >
                      ย้อนกลับ
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlusOutlined />}
                      style={{
                        backgroundColor: "#003366",
                        borderRadius: "8px",
                      }}
                    >
                      เพิ่มโปรโมชั่น
                    </Button>
                  </Space>
                </Row>
              </Form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default PromotionCreate;
