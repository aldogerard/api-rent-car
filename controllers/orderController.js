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

    const { status, pesan } = req.body;

    await updateDoc(doc(db, "orders", id), {
      status,
      pesan,
    });
    successReq(res, 200, "Success update user", { id, status, pesan });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};
