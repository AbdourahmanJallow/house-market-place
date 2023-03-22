// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB86nl8yCx8vRpax1q_67VRSjShzGh6H8k",
    authDomain: "house-marketplace-app-668cd.firebaseapp.com",
    projectId: "house-marketplace-app-668cd",
    storageBucket: "house-marketplace-app-668cd.appspot.com",
    messagingSenderId: "380502488459",
    appId: "1:380502488459:web:7047df7f7121650857ab8e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()