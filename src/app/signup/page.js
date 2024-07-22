// src/app/signup/page.js
'use client';

import React, { useState } from 'react';
import SignUpStep1 from '../components/steps/SignUpStep1';
import SignUpStep2 from '../components/steps/SignUpStep2';
import SignUpStep3 from '../components/steps/SignUpStep3';
import SignUpStep4 from '../components/steps/SignUpStep4';
import SignUpStep5 from '../components/steps/SignUpStep5';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/authContext';
import { useContext } from 'react';

const SignUpPage = () => {
  const { signUpWithEmailAndPassword } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const handleNext = (data) => {
    setFormData({ ...formData, ...data });
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = async (data) => {
    setFormData({ ...formData, ...data });
    try {
      const { email, password, username, birthdate } = formData;
      await signUpWithEmailAndPassword(email, password, username, birthdate);
      router.push('/profile');
    } catch (error) {
      console.error('Error signing up:', error);
      alert(error.message);
    }
  };

  switch (step) {
    case 1:
      return <SignUpStep1 onNext={handleNext} />;
    case 2:
      return <SignUpStep2 onNext={handleNext} onBack={handleBack} />;
    case 3:
      return <SignUpStep3 onNext={handleNext} onBack={handleBack} />;
    case 4:
      return <SignUpStep4 onNext={handleNext} onBack={handleBack} />;
    case 5:
      return <SignUpStep5 onNext={handleFinish} onBack={handleBack} />;
    default:
      return null;
  }
};

export default SignUpPage;
