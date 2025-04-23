// src/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // This line reintroduces the useAuth hook

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const metadata = user.metadata;
        const isNewUser = metadata.creationTime === metadata.lastSignInTime;
        const signUpSentKey = `signUpEventSent_${user.uid}`;
        const signUpSent = localStorage.getItem(signUpSentKey);

        if (isNewUser && !signUpSent) {
          let method = 'email';
          if (user.providerData.length > 0) {
            const providerId = user.providerData[0].providerId;
            method = providerId.includes('google') ? 'google' : providerId;
          }

          const gclid = localStorage.getItem('gclid') || '';

          sendSignUpEvent(user.uid, gclid, method);
          localStorage.setItem(signUpSentKey, 'true');
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendSignUpEvent = (userId, gclid, method = 'email') => {
    if (window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
        gclid: gclid,
        user_id: userId
      });
    } else {
      console.error('gtag is not defined');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};