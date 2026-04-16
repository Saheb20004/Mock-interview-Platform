// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYfh5WvHUoIOfBV2PiHOwoM08GS2GlvMQ",
  authDomain: "mockify-a49b2.firebaseapp.com",
  projectId: "mockify-a49b2",
  storageBucket: "mockify-a49b2.firebasestorage.app",
  messagingSenderId: "1057072037613",
  appId: "1:1057072037613:web:3945f062b3082cbabf96e4",
  measurementId: "G-GHWWQ8RN1S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);