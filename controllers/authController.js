import { v4 } from "uuid";
import bcrypt from "bcrypt";
import validator from "validator";
import "dotenv/config";

import { collection, getDocs, where, getDoc, doc, setDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { db } from "../config/database.js";

import { successReq, failedReq } from "../utils/response.js";

const collect = collection(db, "users");

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const q = where("email", "==", email);
    const datas = await getDocs(query(collect, q));
    const response = datas.docs.map((doc) => {
      const { email, passwordHash, role } = doc.data();
      return {
        id: doc.id,
        email,
        passwordHash,
        role,
      };
    });

    if (response[0] == null) return failedReq(res, 400, "Email is not Valid");

    bcrypt.compare(password, response[0].passwordHash, async (err, result) => {
      if (err) return failedReq(res, 500, err.message);

      if (!result) return failedReq(res, 400, "Password is not Valid");

      const token = process.env.TOKEN_USER;

      const { email, role, id } = response[0];

      successReq(res, 200, "Success Login", { id, email, role, token });
    });
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};
