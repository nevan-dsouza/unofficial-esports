'use client';

import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebaseConfig';
import { doc, getDoc, setDoc, query, where, collection, getDocs } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...user, ...userData });
          setUserRole(userData.role || 'user');
        } else {
          setUser(user);
          setUserRole('user');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Ask for username if signing in for the first time
        setUser({ ...user, firstTime: true });
      } else {
        setUser(user);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert(error.message);
    }
  };

  const signUpWithEmailAndPassword = async (email, password, username, birthdate) => {
    try {
      // Check if the email already exists in Firestore
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Email already in use');
      }

      // Proceed to create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        birthdate,
        signInMethod: 'email',
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        role: 'user' 
      });

      setUser(user);
      setUserRole('user');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already associated with another account.');
      }
      console.error('Error signing up with email and password:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        setUser(user);
      } else {
        throw new Error('User does not exist');
      }
    } catch (error) {
      console.error('Error signing in with email and password:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signInWithGoogle,
        signUpWithEmailAndPassword,
        signInWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
