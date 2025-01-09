import axios from "axios";
import { ReviewInterface } from "../interface/Review";

const apiUrl = "http://localhost:8000";
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetReviews() {
  return await axios
    .get(`${apiUrl}/reviews`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetReviewById(id: string) {
  return await axios
    .get(`${apiUrl}/review/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateReview(data: ReviewInterface) {
  return await axios
    .post(`${apiUrl}/review`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateReviewById(id: string, data: ReviewInterface) {
  return await axios
    .put(`${apiUrl}/review/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteReviewById(id: string) {
  return await axios
    .delete(`${apiUrl}/review/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetReviewTypes() {
  return await axios
    .get(`${apiUrl}/reviewtypes`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetReviews,
  GetReviewById,
  CreateReview,
  UpdateReviewById,
  DeleteReviewById,
  GetReviewTypes,
};
