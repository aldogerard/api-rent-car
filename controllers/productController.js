import { v4 } from "uuid";
import path from "path";
import bcrypt from "bcrypt";
import fs from "fs";

import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/database.js";

import { successReq, failedReq } from "../utils/response.js";

const collect = collection(db, "products");

export const getProduct = async (req, res) => {
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

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const datas = await getDoc(doc(db, "products", id));
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

export const createProduct = async (req, res) => {
  if (req.files == null) return failedReq(res, 400, "No file uploaded");
  const { name, price, brand, year, type } = req.body;
  const file = req.files.file;
  console.log(file);
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = bcrypt.hashSync(file.name, 2).split(".").join("").replace(/\//g, "") + ext;
  console.log(fileName);
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLowerCase())) return failedReq(res, 400, "Invalid image type");
  if (fileSize > 5000000) return failedReq(res, 400, "Image must be less than 5MB");

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return failedReq(res, 502, err.message);
    try {
      await setDoc(doc(db, "products", v4()), {
        name,
        price,
        brand,
        year,
        type,
        images: fileName,
        url,
      });
      successReq(res, 200, "Succes create product");
    } catch (err) {
      failedReq(res, 500, err.message);
    }
  });
};

export const deleteProduct = async (req, res) => {
  const product = await getDoc(doc(db, "products", req.params.id));
  if (!product.data()) return failedReq(res, 400, "Product not found");

  try {
    const filePath = `./public/images/${product.data().images}`;
    fs.unlinkSync(filePath);

    const id = req.params.id;
    await deleteDoc(doc(db, "products", id));
    successReq(res, 200, "Success delete product", id);
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};

export const updateProduct = async (req, res) => {
  const product = await getDoc(doc(db, "products", req.params.id));
  if (!product.data()) return failedReq(res, 400, "Product not found");

  let fileName = "";
  if (req.files == null) {
    fileName = product.data().images;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = bcrypt.hashSync(file.name, 2).split(".").join("").replace(/\//g, "") + ext;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase())) return failedReq(res, 400, "Invalid image type");
    if (fileSize > 5000000) return failedReq(res, 400, "Image must be less than 5MB");

    const filePath = `./public/images/${product.data().images}`;
    fs.unlinkSync(filePath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return failedReq(res, 502, err.message);
    });
  }

  console.log("test");
  const { name, price, brand, year, type } = req.body;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

  try {
    await updateDoc(doc(db, "products", req.params.id), {
      name,
      price,
      brand,
      year,
      type,
      images: fileName,
      url,
    });
    successReq(res, 200, "Succes update product");
  } catch (err) {
    failedReq(res, 500, err.message);
  }
};
