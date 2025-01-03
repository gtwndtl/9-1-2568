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

async function GetCabinTypes() {
  return await axios
    .get(`${apiUrl}/cabin-types`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetCabinTypeById(id: number) {
  return await axios
    .get(`${apiUrl}/cabin-type/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
export {
    GetCabinTypes,
    GetCabinTypeById,
};