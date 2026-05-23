import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const app: FirebaseApp = !getApps().length ? (initializeApp as any)(firebaseConfig) : getApp();

const auth: Auth = (getAuth as any)(app);


let db: Firestore;
try {

    db = (initializeFirestore as any)(app, { experimentalForceLongPolling: true });
    console.log("Firebase: Initialized with long polling");
} catch {

    db = (getFirestore as any)(app);
    console.log("Firebase: Fallback to default Firestore initialization");
}

export { app, auth, db };
