// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
  authDomain: "moto-tracker-57f25.firebaseapp.com",
  databaseURL: "https://moto-tracker-57f25-default-rtdb.firebaseio.com",
  projectId: "moto-tracker-57f25",
  storageBucket: "moto-tracker-57f25.firebasestorage.app",
  messagingSenderId: "123596698999",
  appId: "1:123596698999:web:4c9d870e7c28c05a56dd72",
  measurementId: "G-9P4KCX1VVE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };   