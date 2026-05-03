import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
 apiKey: "AIzaSyCNQxsRp821VUhVrbkwNKsCH2wXkMBpvVU",
  authDomain: "copypaste-2f511.firebaseapp.com",
  projectId: "copypaste-2f511",
  storageBucket: "copypaste-2f511.firebasestorage.app",
  messagingSenderId: "913594663700",
  appId: "1:913594663700:web:ea3095c644673160b07801",
  measurementId: "G-6S71NSPT6V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
