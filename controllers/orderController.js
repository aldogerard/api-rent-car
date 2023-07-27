import { v4 } from "uuid";
import path from "path";
import bcrypt from "bcrypt";
import fs from "fs";

import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, where, query } from "firebase/firestore";
import { db } from "../config/database.js";

import { successReq, failedReq } from "../utils/response.js";

const collect = collection(db, "orders");

export const getOrder = async (req, res) => {
  try {
    const datas = await getDocs(collect);
    const response = datas.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    if (response[0] == null) return failedReq(res, 400, "Data is empty", response);
    successReq(res, 200, "Success", response);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const datas = await getDoc(doc(db, "orders", id));
    if (!datas.data()) return failedReq(res, 400, "Data not found");

    const response = {
      id: datas.id,
      ...datas.data(),
    };
    successReq(res, 200, "Success", response);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const getOrderByIdUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const q = where("idUser", "==", id);
    const datas = await getDocs(query(collect, q));
    const response = datas.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    if (response[0] == null) return failedReq(res, 400, "Data is empty", response);
    successReq(res, 200, "Success", response);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const checkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { idMobil, tanggalOrder } = req.body;

    const q = (where("idMobil", "==", id), where("status", "!=", "selesai"));
    const q2 = query(collect, where("idMobil", "==", id), where("status", "!=", "selesai"));
    const checkMobil = await getDocs(q2);
    const response = checkMobil.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    if (response[0] == null) return successReq(res, 200, "No order found");

    let check = false;
    if (response[0] != null) {
      for (let tanggal of tanggalOrder) {
        response.map((doc) => {
          if (doc.tanggalOrder.includes(tanggal)) {
            check = true;
          }
        });
      }
    }

    if (check) return failedReq(res, 400, "order already exist");
    successReq(res, 200, "No order found");
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { idUser, idMobil, tanggalOrder, hargaSewa, totalHarga } = req.body;

    const q = (where("idMobil", "==", idMobil), where("status", "!=", "selesai"));
    const q2 = query(collect, where("idMobil", "==", idMobil), where("status", "!=", "selesai"));
    const checkMobil = await getDocs(q2);
    const response = checkMobil.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    if (response[0] != null) {
      for (let tanggal of tanggalOrder) {
        if (response[0].tanggalOrder.includes(tanggal)) {
          return failedReq(res, 400, "order already exist");
        }
      }
    }

    const datasUser = await getDoc(doc(db, "users", idUser));
    if (!datasUser.data()) return failedReq(res, 400, "Users not found");

    const responseUser = {
      name: datasUser.data().nama,
      email: datasUser.data().email,
    };

    const datas = await getDoc(doc(db, "products", idMobil));
    if (!datas.data()) return failedReq(res, 400, "Cars not found");

    const responseMobil = {
      url: datas.data().url,
      name: datas.data().name,
    };

    await setDoc(doc(db, "orders", v4()), {
      idUser,
      idMobil,
      tanggalOrder,
      hargaSewa,
      totalHarga,
      status: "pending",
      pesan: "Pembayaran belum selesai",
      uangPembayaran: "",
      uangKembali: "",
      responseMobil,
      responseUser,
    });

    successReq(res, 200, "Success order", { idUser, idMobil, tanggalOrder });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const paymentOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { uangPembayaran, totalHarga } = req.body;

    const order = await getDoc(doc(db, "orders", id));
    if (!order.data()) return failedReq(res, 400, "Data not found");

    if (uangPembayaran < totalHarga) return failedReq(res, 400, "Uang pembayaran kurang");

    await updateDoc(doc(db, "orders", id), {
      uangPembayaran,
      pesan: "Pembayaran selesai",
      status: "proses",
      uangKembali: uangPembayaran - totalHarga,
    });
    successReq(res, 200, "Success payment", { uangPembayaran, pesan: "Pembayaran selesai" });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getDoc(doc(db, "orders", id));
    if (!order.data()) return failedReq(res, 400, "order not found");

    await deleteDoc(doc(db, "orders", id));
    successReq(res, 200, "Success delete order", id);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await getDoc(doc(db, "orders", id));
    if (!order.data()) return failedReq(res, 400, "order not found");

    await updateDoc(doc(db, "orders", id), {
      status: "selesai",
      pesan: "Sewa telah selesai",
    });
    successReq(res, 200, "Success update order", { id, status: "selesai", pesan: "Sewa telah selesai" });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};
