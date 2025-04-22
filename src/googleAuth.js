import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { app } from './firebase';

// Initialize Firebase Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google OAuth credentials
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

// Configure Google provider
googleProvider.setCustomParameters({
  client_id: GOOGLE_CLIENT_ID,
  client_secret: GOOGLE_CLIENT_SECRET,
  prompt: 'select_account'
});

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info
    const user = result.user;
    return { user, token };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Function to set up reCAPTCHA verifier for phone authentication
export const setupRecaptcha = (elementId) => {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
};

// Function to send verification code via SMS
export const sendVerificationCode = async (phoneNumber) => {
  try {
    if (!window.recaptchaVerifier) {
      throw new Error('reCAPTCHA not set up. Call setupRecaptcha first.');
    }
    
    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      phoneNumber, 
      window.recaptchaVerifier
    );
    
    // Save the confirmation result to use it later
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

// Function to verify the code and sign in
export const verifyCode = async (verificationCode) => {
  try {
    if (!window.confirmationResult) {
      throw new Error('No confirmation result found. Call sendVerificationCode first.');
    }
    
    const result = await window.confirmationResult.confirm(verificationCode);
    const user = result.user;
    return { user };
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
};

// Function to sign out
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

export default auth;