'use client';

import React, { useState, useContext } from 'react';
import SignUpStep1 from '../components/steps/SignUpStep1';
import SignUpStep2 from '../components/steps/SignUpStep2';
import SignUpStep3 from '../components/steps/SignUpStep3';
import SignUpStep4 from '../components/steps/SignUpStep4';
import SignUpStep5 from '../components/steps/SignUpStep5';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/authContext';
import { db } from '../lib/firebaseConfig';
import { getDocs, query, where, collection } from 'firebase/firestore';

const SignUpPage = () => {
  const { signUpWithEmailAndPassword } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNext = async (data) => {
    setFormData({ ...formData, ...data });
    if (step === 1 || step === 3) {
      const unique = await checkUniqueness(step, data);
      if (!unique) return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const checkUniqueness = async (step, data) => {
    try {
      if (step === 1) {
        const emailQuery = query(collection(db, 'users'), where('email', '==', data.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          setError('Email already in use');
          return false;
        }
      } else if (step === 3) {
        const usernameQuery = query(collection(db, 'users'), where('username', '==', data.username));
        const usernameSnapshot = await getDocs(usernameQuery);
        if (!usernameSnapshot.empty) {
          setError('Username already taken');
          return false;
        }
      }
      setError('');
      return true;
    } catch (error) {
      console.error('Error checking uniqueness:', error);
      setError('An error occurred. Please try again.');
      return false;
    }
  };

  const handleFinish = async (data) => {
    setFormData({ ...formData, ...data });
    try {
      const { email, password, username, birthdate } = formData;
      await signUpWithEmailAndPassword(email, password, username, birthdate);
      router.push('/profile');
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
    }
  };

  switch (step) {
    case 1:
      return <SignUpStep1 onNext={handleNext} error={error} formData={formData} />;
    case 2:
      return <SignUpStep2 onNext={handleNext} onBack={handleBack} formData={formData} />;
    case 3:
      return <SignUpStep3 onNext={handleNext} onBack={handleBack} error={error} formData={formData} />;
    case 4:
      return <SignUpStep4 onNext={handleNext} onBack={handleBack} formData={formData} />;
    case 5:
      return <SignUpStep5 onNext={handleFinish} onBack={handleBack} />;
    default:
      return null;
  }
};

export default SignUpPage;
