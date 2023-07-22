import { v4 } from "uuid";

import { collection, getDocs, getDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/database.js";

import { successReq, failedReq } from "../utils/response.js";

const collect = collection(db, "message");

export const getMessage = async (req, res) => {
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

export const getMessageById = async (req, res) => {
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

export const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await setDoc(doc(db, "message", v4()), {
      name,
      email,
      message,
      timestamp: new Date().toISOString().split("T")[0] + " " + new Date().toTimeString().split(" ")[0],
    });

    successReq(res, 200, "Success send message", { name, email, message });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await getDoc(doc(db, "message", id));
    if (!message.data()) return failedReq(res, 400, "message not found");

    await deleteDoc(doc(db, "message", id));
    successReq(res, 200, "Success delete message", id);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};
