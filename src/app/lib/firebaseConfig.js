import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4JDGDFPc4hnal-uisyJ5IGXeDVsCQ_nU",
  authDomain: "major-e50dc.firebaseapp.com",
  projectId: "major-e50dc",
  storageBucket: "major-e50dc.appspot.com",
  messagingSenderId: "765980781398",
  appId: "1:765980781398:web:eeb0584666e8967e2604f7",
  measurementId: "G-8GJ9YCV9TE"
};

// Initialize Firebase
let app;
let analytics;
let db;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  if (process.env.NODE_ENV !== 'development') {
    analytics = getAnalytics(app);
  }
}

export { app, db, analytics };