// import { BookingCabinInterface } from "../../interface/Ibooking-cabin";
import axios from "axios";
// import { BookingCabinInterface } from "../../interface/IBookingCabin";

const apiUrl = "http://localhost:8000";

const Authorization = localStorage.getItem("token");

const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetCruiseTrip() {
  return await axios
    .get(`${apiUrl}/cruise-trips`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetCruiseTripById(id: number) {
  return await axios
    .get(`${apiUrl}/cruise-trip/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetAllCruiseTrip() {
  return await axios
    .get(`${apiUrl}/cruisetrips`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
export {
    GetCruiseTrip,
    GetCruiseTripById,
    GetAllCruiseTrip,
};
