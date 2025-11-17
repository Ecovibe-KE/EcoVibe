// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ecivibe.firebaseapp.com",
  projectId: "ecivibe",
  storageBucket: "ecivibe.firebasestorage.app",
  messagingSenderId: "337448707951",
  appId: "1:337448707951:web:3503ddf35f936677086a9a",
  measurementId: "G-5YHZ2B7TCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);