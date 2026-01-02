import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDuuKxml7yurRL1KEfmswbRrkGygE3rd5w",
    authDomain: "fkhr-elbn.firebaseapp.com",
    projectId: "fkhr-elbn",
    storageBucket: "fkhr-elbn.firebasestorage.app",
    messagingSenderId: "826322728576",
    appId: "1:826322728576:web:3cca07267e481a08da9865"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
