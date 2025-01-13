import { PromotionInterface } from "../../interface/Promotion";

import axios from "axios";
import { PromotionUsedInterface } from "../../interface/Promotion_used";

const apiUrl = "http://localhost:8000";

const Authorization = localStorage.getItem("token");

const Bearer = localStorage.getItem("token_type");


const requestOptions = {

  headers: {

    "Content-Type": "application/json",

    Authorization: `${Bearer} ${Authorization}`,

  },

};

async function GetPromotions() {

  return await axios

    .get(`${apiUrl}/promotions`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function GetPromotionById(id: string) {

  return await axios

    .get(`${apiUrl}/promotion/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function UpdatePromotionById(id: string, data: PromotionInterface) {

  return await axios

    .put(`${apiUrl}/promotion/${id}`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function DeletePromotionById(id: string) {

  return await axios

    .delete(`${apiUrl}/promotion/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function CreatePromotion(data: PromotionInterface) {

  return await axios

    .post(`${apiUrl}/promotion`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetDiscountType() {

  return await axios

    .get(`${apiUrl}/discount_type`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetPromotionType() {

  return await axios

    .get(`${apiUrl}/types`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetPromotionTypeById(id: string) {

  return await axios

    .get(`${apiUrl}/type/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetPromotionStatus() {

  return await axios

    .get(`${apiUrl}/status`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetReviewType() {

  return await axios

    .get(`${apiUrl}/review`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function GetPromotionUsed() {

  return await axios

    .get(`${apiUrl}/promotionuseds`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function GetPromotionUsedById(id: string) {

  return await axios

    .get(`${apiUrl}/promotionused/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function UpdatePromotionUsedById(id: string, data: PromotionInterface) {

  return await axios

    .put(`${apiUrl}/promotionused/${id}`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}


async function DeletePromotionUsedById(id: string) {

  return await axios

    .delete(`${apiUrl}/promotionused/${id}`, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}

async function CreatePromotionUsed(data: PromotionUsedInterface) {

  return await axios

    .post(`${apiUrl}/promotionused`, data, requestOptions)

    .then((res) => res)

    .catch((e) => e.response);

}



export {

  GetPromotions,

  GetPromotionById,

  UpdatePromotionById,

  DeletePromotionById,
  
  CreatePromotion,


  GetDiscountType,


  GetPromotionType,

  GetPromotionTypeById,


  GetPromotionStatus,

  
  GetReviewType,



  GetPromotionUsed,

  GetPromotionUsedById,

  UpdatePromotionUsedById,

  DeletePromotionUsedById,

  CreatePromotionUsed,

};