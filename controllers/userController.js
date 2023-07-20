import { v4 } from "uuid";
import bcrypt from "bcrypt";
import validator from "validator";

import { collection, getDocs, where, getDoc, doc, setDoc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { db } from "../config/database.js";

import { successReq, failedReq } from "../utils/response.js";

const collect = collection(db, "users");

export const getUser = async (req, res) => {
  try {
    const q = where("role", "==", "customer");
    const datas = await getDocs(query(collect, q));

    const response = datas.docs.map((doc) => {
      const { username, email, role, nama, alamat, nomor } = doc.data();
      return {
        id: doc.id,
        username,
        email,
        role,
        nama,
        alamat,
        nomor,
      };
    });
    if (response[0] == null) return failedReq(res, 400, "Data is empty", response);
    successReq(res, 200, "Success", response);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;

    const q = where("role", "==", "customer");
    const datas = await getDocs(query(collect, q));

    const response = datas.docs
      .filter((doc) => id == doc.id)
      .map((doc) => {
        const { username, email, role, nama, alamat, nomor } = doc.data();
        if (id === doc.id) {
          return {
            id: doc.id,
            username,
            email,
            role,
            nama,
            alamat,
            nomor,
          };
        }
      });

    if (response[0] == null) return failedReq(res, 400, "User not found");
    successReq(res, 200, "Success", response);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword, nama, alamat, nomor } = req.body;

    if (!validator.isEmail(email)) return failedReq(res, 400, "Email is not valid");

    const q = where("email", "==", email);
    const checkEmail = await getDocs(query(collect, q));
    const response = checkEmail.docs.map((doc) => {
      return {
        id: doc.id,
        email,
      };
    });
    if (response[0] != null) return failedReq(res, 400, "Email is already registered");

    if (password !== confirmPassword) return failedReq(res, 400, "Password not match");

    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    await setDoc(doc(db, "users", v4()), {
      email,
      passwordHash,
      nama,
      role: "customer",
      alamat,
      nomor,
    });
    successReq(res, 200, "Success register", email);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const deleteUser = async (req, res) => {
  const user = await getDoc(doc(db, "users", req.params.id));
  if (!user.data()) return failedReq(res, 400, "User not found");

  try {
    const id = req.params.id;
    await deleteDoc(doc(db, "users", id));
    successReq(res, 200, "Success delete user", id);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const updateUser = async (req, res) => {
  const user = await getDoc(doc(db, "users", req.params.id));
  if (!user.data()) return failedReq(res, 400, "User not found");

  bcrypt.compare(req.body.password, user.data().passwordHash, async (err, result) => {
    if (err) return failedReq(res, 500, err.message);

    if (!result) return failedReq(res, 400, "Password is not Valid");

    try {
      const { email, nama, alamat, nomor, newPassword, confirmPassword } = req.body;

      let passwordHash = "";
      if (newPassword != "" && confirmPassword != "") {
        if (newPassword !== confirmPassword) return failedReq(res, 400, "Password not match");
        const saltRounds = 10;
        passwordHash = bcrypt.hashSync(newPassword, saltRounds);
      } else {
        passwordHash = user.data().passwordHash;
      }

      await updateDoc(doc(db, "users", req.params.id), {
        email,
        nama,
        alamat,
        nomor,
        passwordHash,
      });
      successReq(res, 200, "Success update user", req.params.id);
    } catch (err) {
      failedReq(res, 500, err.message);
    }
  });
};
