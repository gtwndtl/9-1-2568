import React, { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
import { TripPaymentInterface } from "../../interface/ITripPayment";
import { message } from "antd";
import { GetTripPaymentById } from "../../service/https/TripPaymentAPI";
import { GetBookingCabinById } from "../../../booking_cabin/service/https/BookingCabinAPI";
import { BookingTripInterface } from "../../../booking_cabin/interface/IBookingTrip";
import { BookingCabinInterface } from "../../../booking_cabin/interface/IBookingCabin";
import { GetBookingTripById } from "../../../booking_cabin/service/https/BookingTripAPI";
import { GetCabinTypeById } from "../../../booking_cabin/service/https/CabinTypeAPI";
import { CabinTypeInterface } from "../../../booking_cabin/interface/ICabinType";
import { MdFileDownload, MdLocalPrintshop } from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import { GetUsersById } from "../../../services/https";
import { CustomerInterface } from "../../../interfaces/ICustomer";
import LogoCruiseShip from "../../../assets/cruise_ship_logo.jpg";
import dayjs from "dayjs";
import "./TripReceipt.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function TripReceipt() {
  const [tripPaymentID, setTripPaymentID] = useState<number>(0);
  const [tripPayment, setTripPayment] = useState<TripPaymentInterface>();
  const [bookingTrip, setBookingTrip] = useState<BookingTripInterface>();
  const [bookingCabin, setBookingCabin] = useState<BookingCabinInterface>();
  const [cabinType, setCabinType] = useState<CabinTypeInterface>();
  const [customer, setCustomer] = useState<CustomerInterface>();

  const [messageApi, contextHolder] = message.useMessage();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const promoTripData = JSON.parse(localStorage.getItem('promoTripData') || '{}');
  const discountTripAmount = promoTripData.discountTripAmount || 0;
  const promotionTripId = promoTripData.promotionTripId || 0;

  // console.log("tripPaymentID", tripPaymentID);
  // console.log("tripPayment", tripPayment);
  // console.log("bookingTrip", bookingTrip);
  // console.log("bookingCabin", bookingCabin);
  // console.log("cabinType", cabinType);
  const formatPriceWithTwoDecimals = (price: number | string): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
    }).format(Number(price));
  };

  function formatDate(date: Date | string | undefined): string {
    if (!date) return "N/A"; // fallback if date is undefined
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      // timeZoneName: "short",
    }).format(parsedDate);
  }

  const formattedDate = tripPayment?.PaymentDate
    ? dayjs(tripPayment.PaymentDate).format("DD/MM/YYYY") // Adjust format as needed
    : "N/A";

  // const formattedDateCheckIn = bookingCabin?.CheckIn
  //   ? dayjs(bookingCabin.CheckIn).format("DD/MM/YYYY") // Adjust format as needed
  //   : "N/A";

  // const formattedDateCheckOut = bookingCabin?.CheckOut
  //   ? dayjs(bookingCabin.CheckOut).format("DD/MM/YYYY") // Adjust format as needed
  //   : "N/A";

  const getTripPayment = async () => {
    const res = await GetTripPaymentById(tripPaymentID);
    if (res.status === 200) {
      setTripPayment(res.data);

      getBookingTrip(res.data.BookingCabin.BookingTripID);
      getBookingCabin(res.data.BookingCabinID);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getBookingTrip = async (booking_trip_id: number) => {
    const res = await GetBookingTripById(booking_trip_id);
    if (res.status === 200) {
      setBookingTrip(res.data);
      getCustomerByID(res.data.CustomerID);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getBookingCabin = async (booking_cabin_id: number) => {
    const res = await GetBookingCabinById(booking_cabin_id);
    if (res.status === 200) {
      setBookingCabin(res.data);
      getCabinType(res.data.Cabin.CabinTypeID);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  const getCabinType = async (cabin_type_id: number) => {
    const res = await GetCabinTypeById(cabin_type_id);
    if (res.status === 200) {
      setCabinType(res.data);
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

  const handleDownload = async () => {
    if (contentRef.current) {
      const icons = document.querySelectorAll(".icon-container");

      // ซ่อน icons
      icons.forEach((icon) => {
        (icon as HTMLElement).style.display = "none";
      });

      try {
        // ใช้ html2canvas เพื่อจับภาพเนื้อหา
        const canvas = await html2canvas(contentRef.current, {
          scale: 3,
          useCORS: true,
        });

        // แปลง canvas เป็น PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
        pdf.save("payment-receipt.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        // แสดง icons อีกครั้ง
        icons.forEach((icon) => {
          (icon as HTMLElement).style.display = "";
        });
      }
    } else {
      console.error("Content reference is not available.");
    }
  };


  useEffect(() => {
    const intervalId = setInterval(() => {
      const savedData = localStorage.getItem("TripPaymentID");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData !== tripPaymentID) {
          setTripPaymentID(parsedData);
        }
      }
    }, 500); // Check every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [tripPaymentID]);

  useEffect(() => {
    if (tripPaymentID) {
      getTripPayment();
    }
  }, [tripPaymentID]);

  //   useEffect(() => {
  //     if (tripPaymentID) {
  //         localStorage.removeItem("BookingCabinID");
  //         localStorage.removeItem("BookingTripID");
  //         localStorage.removeItem("VAT");

  //         getTripPayment()
  //     }
  //   }, [tripPaymentID]);

  return (
    <section className="trip-receipt-container" ref={contentRef}>
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
        <span>
          Suranaree University of Technology (SUT) is 111 University Avenue,
          Muang District, Nakhon Ratchasima 30000, Thailand123
        </span>
      </div>

      <div className="customer-detail-container">
        <div className="customer-detail">
          <span className="header">BILL TO</span>
          <div className="customer-info">
            <span className="email">
              {customer?.email}
            </span>
            <span className="name">
              {customer?.first_name} {customer?.last_name}
            </span>
            <span className="address">{customer?.Adress}</span>
          </div>
        </div>
        <div className="receipt-detail">
          <div className="receipt-info">
            <span className="header">RECEIPT</span>
            <span>#{tripPayment?.ID}</span>
          </div>
          <div className="receipt-info">
            <span className="header">RECEIPT DATE</span>
            <span>{formattedDate}</span>
          </div>
          <div className="receipt-info">
            <span className="header">PAYMENT METHOD</span>
            <span>{tripPayment?.PaymentMethod}</span>
          </div>
        </div>
      </div>

      <table className="table-trip-details">
        <thead>
          <tr>
            <th className="number">NO.</th>
            <th className="description">Description</th>
            {/* <th className="quantity">Quantity</th> */}
            {/* <th className="unit-price">Unit Price</th> */}
            <th className="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="number">1</td>
            <td className="trip-detail">
              <span>
                <p><strong>Cruise Trip</strong></p>
                <p>
                  {bookingTrip?.CruiseTrip?.CruiseTripName}{" "}
                  {bookingTrip?.CruiseTrip?.ParticNum} Night
                </p>
              </span>
            </td>
            <td className="amount">{formatPriceWithTwoDecimals(bookingTrip?.CruiseTrip?.PlanPrice)}</td>
          </tr>
          <tr>
            <td className="number">2</td>
            <td className="cabin-detail">
              <span>
                <p><strong>Cabin Detail</strong></p>
                <p>Cabin Number: {bookingCabin?.Cabin?.CabinNumber}</p>
                <p>Cabin Type: {cabinType?.TypeName}</p>
              </span>
            </td>
            <td className="amount">{formatPriceWithTwoDecimals(cabinType?.CabinPrice)}</td>
          </tr>
        </tbody>
      </table>

      <table className="table-summary-container">
        <tbody>
          <tr>
            <th>Promotion code</th>
            <td>-{formatPriceWithTwoDecimals(discountTripAmount)}</td>
          </tr>
          <tr>
            <th>VAT 7%</th>
            <td>{formatPriceWithTwoDecimals(tripPayment?.VAT ?? 0)}</td>
          </tr>
          <tr>
            <th>Subtotal</th>
            <td>
              {formatPriceWithTwoDecimals(tripPayment?.BookingCabin?.TotalPrice ?? 0)}
            </td>
          </tr>
          <tr>
            <th>Total</th>
            <td>{formatPriceWithTwoDecimals((tripPayment?.TotalPrice ?? 0))}</td>
          </tr>
        </tbody>
      </table>

      <hr />
      <div className="description-receipt">
        <p>
          This e-tax invoice/e-receipt is prepared by Cruise Ship and submitted
          electronically to the Revenue Department.
        </p>
        <br />
        <p>
          Please carefully check the document and any amendment can be requested
          within 15 days. Otherwise, the e-tax invoice/e-receipt shall be deemed
          complete and accurate for submission.
        </p>
        <br />
      </div>
      <div className="icon-container">
        <div className="print-icon-container" onClick={() => reactToPrintFn()}>
          <MdLocalPrintshop className="print-icon"></MdLocalPrintshop>
          <p><strong>PRINT</strong></p>
        </div>
        <div className="download-icon-container" onClick={handleDownload}>
          <MdFileDownload className="download-icon"></MdFileDownload>
          <p><strong>DOWNLOAD</strong></p>
        </div>
      </div>
    </section>
  );
}

export default TripReceipt;
