import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC5FB7IOshy8B9n1MnI88XKgnL2a4u1OSU",
  authDomain: "reactnative-8d3a9.firebaseapp.com",
  projectId: "reactnative-8d3a9",
  storageBucket: "reactnative-8d3a9.firebasestorage.app",
  messagingSenderId: "204158945479",
  appId: "1:204158945479:web:cc2bf54b56d88ef14ed6e2",
  measurementId: "G-B9YE451K23"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
