// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ecovibe-9f2fe.firebaseapp.com",
  projectId: "ecovibe-9f2fe",
  storageBucket: "ecovibe-9f2fe.firebasestorage.app",
  messagingSenderId: "527888606418",
  appId: "1:527888606418:web:5957c3c9cc5590b86c790b",
  measurementId: "G-K5LEMNEX5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);