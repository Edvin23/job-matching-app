// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    onAuthStateChanged,
    connectAuthEmulator,
    getRedirectResult,
    signInWithRedirect,
    signOut
 } from "firebase/auth";

 import {
    getFirestore,
    doc,
    getDoc,
    connectFirestoreEmulator
 } from 'firebase/firestore';

 import {getFunctions, connectFunctionsEmulator} from 'firebase/functions';
 import { getStorage , connectStorageEmulator } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app);
const functions = getFunctions(app);

if (process.env.NODE_ENV === 'development'){
    connectAuthEmulator(auth, 'http://localHost:9099');
}

export {
    app,
    auth,
    googleProvider,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    isSignInWithEmailLink,
    signInWithRedirect,
    onAuthStateChanged,
    getRedirectResult
};