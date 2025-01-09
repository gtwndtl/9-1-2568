import { useEffect, useRef, useState } from "react";
import { CustomerInterface } from "../../../interfaces/ICustomer";
import { FoodServicePaymentInterface } from "../../interface/IFoodServicePayment";
import { OrderDetailInterface } from "../../../food_service/interface/IOrderDetail";
import { GetOrderDetail } from "../../../food_service/service/https/OrderDetailAPI";
import { GetUsersById } from "../../../services/https";
import { GetFoodServicePaymentById } from "../../service/https/FoodServicePaymentAPI";
import { message } from "antd";
import dayjs from "dayjs";
import LogoCruiseShip from "../../../assets/cruise_ship_logo.jpg"
import "./FoodReceipt.css";
// import Spinner from "../../../components/spinner";
import { MdFileDownload, MdLocalPrintshop } from "react-icons/md";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";
// import Spinner from "../../../components/spinner";

export default function FoodReceipt() {
  const [foodServicePaymentID, setFoodServicePaymentID] = useState<number | null>(null);
  const [foodServicePayment, setFoodServicePayment] = useState<FoodServicePaymentInterface>();
  const [messageApi, contextHolder] = message.useMessage();
  const [customer, setCustomer] = useState<CustomerInterface>();
  const [orderDetail, setOrderDetail] = useState<OrderDetailInterface[]>([]);
  // const [, setIsLoaded] = useState(false); // Track if data is loaded

  const promoData = JSON.parse(localStorage.getItem('promoData') || '{}');
  const discountAmount = promoData.discountAmount || 0;


  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const formatPriceWithTwoDecimals = (price: number | string): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    }).format(Number(price));
  };
  
  const formattedDate = foodServicePayment?.PaymentDate
    ? dayjs(foodServicePayment.PaymentDate).format("DD/MM/YYYY") // Adjust format as needed
    : "N/A";

  const getOrderDetail = async () => {
    const res = await GetOrderDetail();
    if (res.status === 200) {
      setOrderDetail(res.data);
    } else {
      setOrderDetail([]);
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getFoodServicePaymentById = async () => {
    if (!foodServicePaymentID) return;
    const res = await GetFoodServicePaymentById(foodServicePaymentID);
    if (res.status === 200) {
      setFoodServicePayment(res.data);
      getCustomerByID(res.data.Order.CustomerID);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getCustomerByID = async (customerID: number) => {
    const res = await GetUsersById(customerID);
    if (res.status === 200) {
      setCustomer(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: res?.data?.error || "Unknown error",
      });
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedData = localStorage.getItem("foodServicePaymentID");
      // console.log("savedData", savedData);  // ตรวจสอบค่าที่เก็บใน localStorage
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (!isNaN(parsedData)) {
          setFoodServicePaymentID(parsedData);
          clearInterval(intervalId);
          
        } else {
          console.error("foodServicePaymentID is not valid in localStorage");
        }
      }
    }, 500);
  
    return () => clearInterval(intervalId);
  }, []);
  

  useEffect(() => {
    if (foodServicePaymentID !== null) {
      getOrderDetail();
      getFoodServicePaymentById();
    }
  }, [foodServicePaymentID]);  

  // useEffect(() => {
  //   // Set isLoaded when all data is ready (foodServicePayment, customer, orderDetails)
  //   if (foodServicePayment && customer && orderDetail.length > 0) {
  //     setIsLoaded(true);
  //   }
  // }, [foodServicePayment, customer, orderDetail]);


  // Filter order details where OrderID matches the OrderID in foodServicePayment
  const filteredOrderDetails = orderDetail.filter((detail) => foodServicePayment?.OrderID === detail.OrderID);

const handleDownload = async () => {
  if (contentRef.current) {
    // Hide the icons before capturing
    const icons = document.querySelectorAll(".icon-container");
    icons.forEach((icon) => {
      (icon as HTMLElement).style.display = "none";
    });

    // Change font size to 12px
    const container = contentRef.current;
    const originalFontSize = container.style.fontSize; // Save original font size
    container.style.fontSize = "12px";

    // Step 1: Capture the content as a canvas using html2canvas
    const canvas = await html2canvas(container, {
      scale: 3, // Increase the resolution of the canvas (higher scale = better quality)
      useCORS: true, // Ensures that images from cross-origin sources are captured
    });

    // Step 2: Convert the canvas to an image (base64 format)
    const imgData = canvas.toDataURL("image/png");

    // Step 3: Create a new PDF document using jsPDF
    const pdf = new jsPDF("p", "mm", "a4"); // A4 paper size, portrait orientation

    // Step 4: Calculate image dimensions to fit it within the A4 paper size
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm padding on each side
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio

    // Step 5: Add the image to the PDF
    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

    // Step 6: Save the generated PDF
    pdf.save("payment-receipt.pdf");

    // Restore font size and icons after generating the PDF
    container.style.fontSize = originalFontSize;
    icons.forEach((icon) => {
      (icon as HTMLElement).style.display = "";
    });
  } else {
    console.error("Content reference is not available.");
  }
};


  return (
    <section className="food-receipt-container" ref={contentRef}>
      {contextHolder}
      <div className="receipt-header">
        <div className="logo">
          <img src={LogoCruiseShip} alt="LogoCruiseShip" />
          <h1>TITANIC</h1>
        </div>
        <h1>TAX INVOICE / RECEIPT</h1>
      </div>

      <div className="cruise-ship-address">
        <span>Cruise Ship Limited</span>
        <span>Suranaree University of Technology (SUT) is 111 University Avenue, Muang District, Nakhon Ratchasima 30000, Thailand123</span>
      </div>

      <div className="customer-detail-container">
        <div className="customer-detail">
          <span className="header">BILL TO</span>
          <div className="customer-info">
            <span className="name">{customer?.FirstName} {customer?.LastName}</span>
            <span className="address">4312 Wood Road New York, NY 100031</span>
          </div>
        </div>
        <div className="receipt-detail">
          <div className="receipt-info">
            <span className="header">RECEIPT</span>
            <span>#{foodServicePayment?.ID}</span>
          </div>
          <div className="receipt-info">
            <span className="header">RECEIPT DATE</span>
            <span>{formattedDate}</span>
          </div>
          <div className="receipt-info">
            <span className="header">PAYMENT METHOD</span>
            <span>{foodServicePayment?.PaymentMethod}</span>
          </div>
        </div>
      </div>

      <table className="table-order-details">
        <thead>
          <tr>
            <th className="description">Description</th>
            <th className="quantity">Quantity</th>
            <th className="unit-price">Unit Price</th>
            <th className="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrderDetails.map((detail, index) => (
            <tr key={detail.ID}>
              <td className="menu-name">{index + 1}. {detail.Menu?.MenuName}</td>
              <td className="quantity">{formatPriceWithTwoDecimals(detail.Quantity ?? 0)}</td>
              <td className="unit-price">{formatPriceWithTwoDecimals((detail.Amount ?? 0) / (detail.Quantity ?? 0))}</td>
              <td className="amount">{formatPriceWithTwoDecimals(detail.Amount ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="table-summary-container">
        <tbody>
          <tr>
            <th>Promotion code</th>
            <td>-{discountAmount}</td>
          </tr>
          <tr>
            <th>VAT 7%</th>
            <td>{formatPriceWithTwoDecimals(foodServicePayment?.VAT ?? 0)}</td>
          </tr>
          <tr>
            <th>Subtotal</th>
            <td>{formatPriceWithTwoDecimals(foodServicePayment?.Order?.TotalAmount ?? 0)}</td>
          </tr>
          <tr>
            <th>Total</th>
            <td>{formatPriceWithTwoDecimals(foodServicePayment?.Price ?? 0)}</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <div className="description-receipt">
        <p>This e-tax invoice/e-receipt is prepared by Cruise Ship and submitted electronically to the Revenue Department.</p><br />
        <p>Please carefully check the document and any amendment can be requested within 15 days. Otherwise, the e-tax invoice/e-receipt shall be deemed complete and accurate for submission.</p><br />
      </div>
      <div className="icon-container">
        <div className="print-icon-container"  onClick={() => reactToPrintFn()}>
          <MdLocalPrintshop className="print-icon"></MdLocalPrintshop>
          <p><strong>PRINT</strong></p>
        </div>
        <div className="download-icon-container"  onClick={handleDownload}>
          <MdFileDownload className="download-icon"></MdFileDownload>
          <p><strong>DOWNLOAD</strong></p>
        </div>
      </div>
    </section>
  );
}
