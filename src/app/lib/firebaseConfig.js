// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAAX03szdNn5MVWnsmARSK0LfLdY0j97s",
  authDomain: "unofficial-esports.firebaseapp.com",
  projectId: "unofficial-esports",
  storageBucket: "unofficial-esports.appspot.com",
  messagingSenderId: "186924423393",
  appId: "1:186924423393:web:1a9704b36b6dc8d9337fa0",
  measurementId: "G-VRKCE3VS6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);