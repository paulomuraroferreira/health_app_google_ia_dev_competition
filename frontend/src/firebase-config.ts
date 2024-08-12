import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "dev-competition-8f302.firebaseapp.com",
  projectId: "dev-competition-8f302",
  storageBucket: "dev-competition-8f302.appspot.com",
  messagingSenderId: "765053358709",
  appId: "1:765053358709:web:f48e15e1eef522e448de3c",
  measurementId: "G-L51X3WFCR4",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const useEmulators = import.meta.env.VITE_FIREBASE_EMULATOR === "true";
if (useEmulators) {
  console.log("Using Firebase Emulators");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}
