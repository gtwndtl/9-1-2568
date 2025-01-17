import { useState, useEffect } from "react";
import { Space, Button, message, Modal, Select, Drawer, Table, Tag } from "antd";
import { EnvironmentOutlined, ShoppingCartOutlined, CheckCircleOutlined, MinusCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, CopyOutlined, PercentageOutlined, DollarOutlined } from "@ant-design/icons";
import { GetPromotions, DeletePromotionById, GetPromotionType, GetPromotionStatus, GetDiscountType, } from "../../service/htpps/PromotionAPI";
import { PromotionInterface } from "../../interface/Promotion";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Navbar from "../../../adminpage/navbar";
import "./index.css";
import { ColumnType } from "antd/es/table";
import Loader from "../../../components/third-party/Loader";

function Promotion() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionInterface[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<Record<number, string>>({});
  const [promotionStatuses, setPromotionStatuses] = useState<Record<number, string>>({});
  const [promotionDiscounts, setPromotionDiscounts] = useState<Record<number, string>>({});
  const [originalPromotions, setOriginalPromotions] = useState<PromotionInterface[]>([]);
  const [messageApi] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionInterface | null>(null);
  const [searchCode, setSearchCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true); // State for loader

  const [filters, setFilters] = useState({
    type_id: null,
    status_id: null,
    discount_id: null,
  });

  const formatNumber = (value: number | string) => {
    return new Intl.NumberFormat().format(Number(value));
  };

  const columns: ColumnType<PromotionInterface>[] = [
    {
      title: "รหัสโปรโมชั่น",
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <Space>
          <span style={{ fontFamily: "Arial, sans-serif" }}>{text}</span>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(String(text));
              message.success("คัดลอกสำเร็จ!");
            }}
            style={{
              borderRadius: "4px",
              color: "#003366",
              border: "1px solid #003366",
              backgroundColor: "white",
            }}
          />
        </Space>
      ),
    },
    {
      title: "ชื่อ",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span style={{ fontFamily: "Arial, sans-serif" }}>{text}</span>
      ),
    },
    {
      title: "รายละเอียด",
      dataIndex: "details",
      key: "details",
      render: (text: any) => (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            maxWidth: "200px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {text || "-"}
        </span>
      ),
    },
    {
      title: "วันเริ่มต้น",
      dataIndex: "start_date",
      key: "start_date",
      render: (text: Date) => dayjs(text).format("DD/MM/YYYY")
    },
    {
      title: "วันสิ้นสุด",
      dataIndex: "end_date",
      key: "end_date",
      render: (text: Date) => dayjs(text).format("DD/MM/YYYY")
    },
    {
      title: "ประเภทส่วนลด",
      key: "discount_id",
      render: (record: { discount_id: string }) => {
        const discountMap: Record<number, { text: string; icon: React.ReactNode; color: string }> = {
          1: { text: "เปอร์เซ็นต์", icon: <PercentageOutlined />, color: "blue" },
          2: { text: "จำนวนเงิน", icon: <DollarOutlined />, color: "pink" },
        };

        const discount = discountMap[Number(record.discount_id)] || { text: "-", icon: null, color: "default" };

        return (
          <Tag
            icon={discount.icon}
            color={discount.color}
            style={{ fontSize: "14px", fontFamily: "Arial, sans-serif", display: "flex", alignItems: "center" }}
          >
            {discount.text}
          </Tag>
        );
      },
    },
    {
      title: "ส่วนลด",
      key: "discount",
      render: (record: { discount: string; discount_id: number; }) => {
        if (record.discount || record.discount === "0") {
          return record.discount_id === 1
            ? `${record.discount}%`
            : `${formatNumber(record.discount)}฿`;
        }
        return "-";
      },
    },
    {
      title: "ส่วนลดสูงสุด (฿)",
      dataIndex: "limit_discount",
      sorter: (a: PromotionInterface, b: PromotionInterface) =>
        a.limit_discount - b.limit_discount,
      render: (value: string | number) => (
        <span style={{ fontFamily: "Arial, sans-serif" }}>
          {value === 0 ? "-" : formatNumber(value) || "-"}
        </span>
      ),
    },
    {
      title: "ราคาขั้นต่ำ (฿)",
      dataIndex: "minimum_price",
      sorter: (a: PromotionInterface, b: PromotionInterface) => a.minimum_price - b.minimum_price,
      key: "minimum_price",
      render: (value: string | number) => (
        <span style={{ fontFamily: "Arial, sans-serif" }}>
          {formatNumber(value) || "-"}
        </span>
      ),
    },
    {
      title: "จำนวนที่จำกัด",
      dataIndex: "limit",
      sorter: (a: PromotionInterface, b: PromotionInterface) => a.limit - b.limit,
      key: "limit",
      render: (value: string | number) => (
        <span style={{ fontFamily: "Arial, sans-serif" }}>
          {formatNumber(value) || "-"}
        </span>
      ),
    },
    {
      title: "ที่ใช้แล้ว (ครั้ง)",
      dataIndex: "count_limit",
      sorter: (a: PromotionInterface, b: PromotionInterface) => a.count_limit - b.count_limit,
      key: "count_limit",
      render: (value: string | number) => (
        <span style={{ fontFamily: "Arial, sans-serif" }}>
          {formatNumber(value) || "-"}
        </span>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status_id",
      filters: [
        { text: "เปิดใช้งาน", value: 1 },
        { text: "เต็ม", value: 2 },
        { text: "หมดอายุ", value: 3 },
        { text: "ยกเลิก", value: 4 }
      ],
      onFilter: (value, record) => record.status_id === value,
      render: (status_id: string | number) => {
        const statusMap: Record<
          string | number,
          { text: string; color: string; icon?: React.ReactNode }
        > = {
          1: { text: "เปิดใช้งาน", color: "green", icon: <CheckCircleOutlined /> },
          2: { text: "เต็ม", color: "red", icon: <MinusCircleOutlined /> },
          3: { text: "หมดอายุ", color: "gray", icon: <CloseCircleOutlined /> },
          4: { text: "ยกเลิก", color: "orange", icon: <ExclamationCircleOutlined /> },
        };
        const status = statusMap[status_id] || { text: "-", color: "default" };

        return (
          <Tag
            icon={status.icon}
            color={status.color}
            style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}
          >
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: "ประเภท",
      dataIndex: "type_id",
      filters: [
        { text: "Trip and Cabin", value: 1 },
        { text: "Food", value: 2 },
      ],
      onFilter: (value, record) => record.type_id === value,
      render: (type_id: string | number) => {
        const statusMap: Record<
          string | number,
          { text: string; color: string; icon?: React.ReactNode }
        > = {
          1: { text: "Trip and Cabin", color: "blue", icon: <EnvironmentOutlined /> },  // ใช้ไอคอนที่เกี่ยวข้องกับทริป
          2: { text: "Food", color: "orange", icon: <ShoppingCartOutlined /> },  // ใช้ไอคอนที่เกี่ยวข้องกับอาหาร
        };

        const status = statusMap[type_id] || { text: "-", color: "default" };

        return (
          <Tag
            icon={status.icon}
            color={status.color}
            style={{ fontSize: "14px", fontFamily: "Arial, sans-serif" }}
          >
            {status.text}
          </Tag>
        );
      },
    },

    {
      key: "action",
      render: (_: any, record: PromotionInterface) => (
        <Space size="small" style={{ justifyContent: "center" }}>
          <button className="Btn-edit" onClick={() => navigate(`/admin/promotion/edit/${record.ID}`)}>Edit
            <svg className="svg-edit" viewBox="0 0 512 512">
              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path></svg>
          </button>
          <button className="delete-Button" onClick={() => showDeleteModal(record)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 50 59"
              className="delete-bin"
            >
              <path
                fill="#B5BAC1"
                d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
              ></path>
              <path
                fill="#B5BAC1"
                d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
              ></path>
              <path
                fill="#B5BAC1"
                d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
                clip-rule="evenodd"
                fill-rule="evenodd"
              ></path>
              <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
            </svg>

            <span className="delete-tooltip">Delete</span>
          </button>

        </Space>
      ),
    },
  ];



  const showDeleteModal = (record: PromotionInterface) => {
    setSelectedPromotion(record);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;
    const res = await DeletePromotionById(selectedPromotion.ID!.toString());

    if (res.status === 200) {
      messageApi.open({ type: "success", content: res.data.message });
      await getPromotions();
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถลบโปรโมชั่นได้",
      });
    }
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const getPromotions = async () => {
    const res = await GetPromotions();
    if (res.status === 200) {
      // กรองข้อมูลที่ promotion.code ไม่ว่าง
      const filteredData = res.data.filter((promotion: { code: string; }) => promotion.code?.trim());

      setOriginalPromotions(filteredData); // เก็บข้อมูลต้นฉบับที่ผ่านการกรอง
      setPromotions(filteredData); // แสดงข้อมูลในตาราง
    } else {
      setOriginalPromotions([]);
      setPromotions([]);
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดโปรโมชั่นได้",
      });
    }
  };



  const getPromotionTypes = async () => {
    const res = await GetPromotionType();
    if (res.status === 200) {
      const typeMap = res.data.reduce(
        (acc: Record<number, string>, type: { ID: number; type: string }) => {
          acc[type.ID] = type.type;
          return acc;
        },
        {}
      );
      setPromotionTypes(typeMap);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดประเภทโปรโมชั่นได้",
      });
    }
  };

  const getPromotionStatuses = async () => {
    const res = await GetPromotionStatus();
    if (res.status === 200) {
      const statusMap = res.data.reduce(
        (acc: Record<number, string>, status: { ID: number; status: string }) => {
          acc[status.ID] = status.status;
          return acc;
        },
        {}
      );
      setPromotionStatuses(statusMap);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดสถานะโปรโมชั่นได้",
      });
    }
  };

  const getPromotionDiscounts = async () => {
    const res = await GetDiscountType();
    if (res.status === 200) {
      const discountMap = res.data.reduce(
        (acc: Record<number, string>, discount: { ID: number; discount_type: string }) => {
          acc[discount.ID] = discount.discount_type;
          return acc;
        },
        {}
      );
      setPromotionDiscounts(discountMap);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error || "ไม่สามารถโหลดประเภทส่วนลดได้",
      });
    }
  };

  const applyFilters = () => {
    const filtered = originalPromotions.filter((promo) => {
      const matchesType = !filters.type_id || promo.type_id === filters.type_id;
      const matchesStatus = !filters.status_id || promo.status_id === filters.status_id;
      const matchesDiscount = !filters.discount_id || promo.discount_id === filters.discount_id;
      return matchesType && matchesStatus && matchesDiscount;
    });
    setPromotions(filtered); // อัปเดตข้อมูลที่แสดงในตาราง
    setIsFilterDrawerOpen(false);
  };



  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Show loader

      // Create a minimum delay of 3 seconds
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch data
      const fetchPromotions = getPromotions();
      const fetchTypes = getPromotionTypes();
      const fetchStatuses = getPromotionStatuses();
      const fetchDiscounts = getPromotionDiscounts();

      // Wait for both data fetching and minimum delay
      await Promise.all([fetchPromotions, fetchTypes, fetchStatuses, fetchDiscounts, minimumDelay]);

      setIsLoading(false); // Hide loader after data is fetched and delay is complete
    };

    fetchData();
  }, []);


  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.code?.toLowerCase().includes(searchCode.toLowerCase())
  );


  const totalPromotions = promotions.length;
  const type1Promotions = promotions.filter(promo => promo.type_id === 1).length;
  const type2Promotions = promotions.filter(promo => promo.type_id === 2).length;


  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  // Adjusted to take (page, pageSize) as parameters
  const handleTableChange = (page: number, pageSize: number) => {
    setCurrentPage(page);  // Set the current page
    setPageSize(pageSize);  // Set the page size
  };



  return (
    <div>
      <Navbar />
      {isLoading ? (
        <div className="spinner-review-container">
          <Loader />
        </div>
      ) : (
        <div className="promotion-admin-page" style={{ padding: "20px" }}>
          <div className="promotion-layout-container">
            <div className="actions-container">
              <div className="button-create">
                <button type="button" className="promotion-create-button" onClick={() => navigate(`/admin/promotion/create`)}>
                  <span className="promotion-create-button__text">Add Code</span>
                  <span className="promotion-create-button__icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      stroke="currentColor"
                      height="24"
                      fill="none"
                      className="svg"
                    >
                      <line y2="19" y1="5" x2="12" x1="12"></line>
                      <line y2="12" y1="12" x2="19" x1="5"></line>
                    </svg>
                  </span>
                </button>
              </div>
              <div className="filter-search">
                <div className="SearchInputContainer">
                  <input
                    placeholder="Search"
                    id="input"
                    className="search-input"
                    name="text"
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                  <label className="labelforsearch" htmlFor="input">
                    <svg className="searchIcon" viewBox="0 0 512 512">
                      <path
                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                      ></path>
                    </svg>
                  </label>
                </div>

                <button title="filter" className="filter" onClick={() => setIsFilterDrawerOpen(true)}>
                  <svg viewBox="0 0 512 512" height="1em">
                    <path
                      d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"
                    ></path>
                  </svg>
                </button>

                <Drawer
                  title="กรองโปรโมชั่น"
                  placement="right"
                  closable
                  onClose={() => setIsFilterDrawerOpen(false)}
                  open={isFilterDrawerOpen}
                  width={300}
                  className="promotion-filter-drawer"
                >
                  <div className="promotion-filter-section">
                    <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>ประเภทโปรโมชั่น</h4>
                    <Select
                      placeholder="เลือกประเภทโปรโมชั่น"
                      value={filters.type_id}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, type_id: value }))
                      }
                      allowClear
                    >
                      {Object.entries(promotionTypes).map(([id, type]) => (
                        <Select.Option key={id} value={parseInt(id)}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="promotion-filter-section">
                    <h4>สถานะ</h4>
                    <Select
                      placeholder="เลือกสถานะ"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                      }}
                      value={filters.status_id}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, status_id: value }))
                      }
                      allowClear
                    >
                      {Object.entries(promotionStatuses).map(([id, status]) => (
                        <Select.Option key={id} value={parseInt(id)}>
                          {status}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="promotion-filter-section">
                    <h4>ประเภทส่วนลด</h4>
                    <Select
                      placeholder="เลือกประเภทส่วนลด"
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                      }}
                      value={filters.discount_id}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, discount_id: value }))
                      }
                      allowClear
                    >
                      {Object.entries(promotionDiscounts).map(([id, discount]) => (
                        <Select.Option key={id} value={parseInt(id)}>
                          {discount}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="primary"
                    onClick={applyFilters}
                    className="promotion-usefilter-button"
                  >
                    ใช้ตัวกรอง
                  </Button>
                  <Button
                    className="promtion-reset-filter-button"
                    type="default"
                    onClick={() => {
                      setFilters({ type_id: null, status_id: null, discount_id: null });
                      setPromotions(originalPromotions); // คืนค่าข้อมูลต้นฉบับ
                      setIsFilterDrawerOpen(false);
                    }}
                  >
                    รีเซ็ตตัวกรอง
                  </Button>
                </Drawer>
                <Modal
                  title={<h2 style={{ textAlign: 'center', margin: 0 }}>ยืนยันการลบโปรโมชั่น</h2>}
                  open={isModalOpen}
                  onOk={handleDelete}
                  onCancel={() => setIsModalOpen(false)}
                  okText="ยืนยัน"
                  cancelText="ยกเลิก"
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
                    คุณต้องการลบโปรโมชั่นนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </p>
                  <p style={{ fontSize: '14px', color: 'gray' }}>
                    กรุณายืนยันการกระทำของคุณด้านล่าง
                  </p>
                </Modal>
              </div>
            </div>
            <div className="table-container">
              <Table
                className="promotion-ant-table"
                rowKey="ID"
                columns={columns}
                dataSource={filteredPromotions}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ['7', '10', '20'],
                  onChange: handleTableChange,
                  onShowSizeChange: (size) => setPageSize(size),
                }}
              />
            </div>

          </div>
          <div className="promotion-summary">
            <div className="summary-item">
              <span className="summary-title">Total Code:</span>
              <span className="summary-value">{totalPromotions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-title">Total Trip and Cabin:</span>
              <span className="summary-value">{type1Promotions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-title">Total Food:</span>
              <span className="summary-value">{type2Promotions}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Promotion;
