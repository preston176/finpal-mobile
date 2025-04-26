// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAQ9f7aixh1wA4MhG0_qfVm5Feazxh2qo",
  authDomain: "finpal-mobile.firebaseapp.com",
  projectId: "finpal-mobile",
  storageBucket: "finpal-mobile.firebasestorage.app",
  messagingSenderId: "835525130239",
  appId: "1:835525130239:web:c95ffd0a43de221c2119ca",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);
