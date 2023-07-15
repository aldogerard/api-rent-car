// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCq25E7kzPfkXGu5YM3Tz08o3WW6ngrPqw",
  authDomain: "api-rentcar.firebaseapp.com",
  projectId: "api-rentcar",
  storageBucket: "api-rentcar.appspot.com",
  messagingSenderId: "150503562735",
  appId: "1:150503562735:web:769111a6983d6f8bc36a1a",
  measurementId: "G-X49GRF9PFB",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
