// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    onAuthStateChanged,
    connectAuthEmulator,
    getRedirectResult,
    signInWithRedirect
 } from "firebase/auth";

// Import Firestore functions
import {
    connectFirestoreEmulator,
    getFirestore,
    // These are commented out but kept for future use
     doc,
     getDoc,
    // connectFirestoreEmulator
} from 'firebase/firestore';

// Import Functions and Storage
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

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
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  aiKey: process.env.OPENAI_API_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// eslint-disable-next-line no-unused-vars
const storage = getStorage(app);
// eslint-disable-next-line no-unused-vars
const db = getFirestore(app);
// eslint-disable-next-line no-unused-vars
const functions = getFunctions(app);

// if (process.env.NODE_ENV === 'development'){
//     connectAuthEmulator(auth, 'http://localHost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
// }

export {
    app,
    auth,
    googleProvider,
    storage,
    functions,
    analytics,
    db,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    isSignInWithEmailLink,
    signInWithRedirect,
    onAuthStateChanged,
    getRedirectResult
};