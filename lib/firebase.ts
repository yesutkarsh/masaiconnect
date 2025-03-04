import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAUfQ30jmkTbrQYGrQVoLTbQtdA4gXKz_o",
  authDomain: "masai-31677.firebaseapp.com",
  databaseURL: "https://masai-31677-default-rtdb.firebaseio.com",
  projectId: "masai-31677",
  storageBucket: "masai-31677.firebasestorage.app",
  messagingSenderId: "15287212867",
  appId: "1:15287212867:web:0066573c1a62d2f459adf6",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

