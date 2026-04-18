import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa5RDXZ30g7wvSyy-oerqsBkp4rYYJ09M",
  authDomain: "react-facebook-b9444.firebaseapp.com",
  projectId: "react-facebook-b9444",
  storageBucket: "react-facebook-b9444.firebasestorage.app",
  messagingSenderId: "932693584566",
  appId: "1:932693584566:web:cfbe72cedb288878641417",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ ADD THIS
