// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THESE WITH YOUR ACTUAL CONFIG VALUES FROM FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyBv-gWc0wi5OqEe2QMqSmdU5bDD1_cggb0",
    authDomain: "ethree-cb6f8.firebaseapp.com",
    projectId: "ethree-cb6f8",
    storageBucket: "ethree-cb6f8.firebasestorage.app",
    messagingSenderId: "217969377904",
    appId: "1:217969377904:web:8187eb897f977fd3e2eab5",
    measurementId: "G-5X993KR67L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
