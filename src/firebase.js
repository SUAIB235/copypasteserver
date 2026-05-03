import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkaqNZtbZkKFbyrd1mmwkcpqNywApp80s",
  authDomain: "scammersdata.firebaseapp.com",
  projectId: "scammersdata",
  storageBucket: "scammersdata.firebasestorage.app",
  messagingSenderId: "989849833704",
  appId: "1:989849833704:web:77a5ba56a940b7c047b95d",
  measurementId: "G-Q1F4K03169"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
