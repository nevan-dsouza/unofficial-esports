'use client';

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../context/authContext';

const SignInPage = () => {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { signInWithGoogle, signInWithEmail, user } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.firstTime) {
        router.push('/username');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    }
  }, [user, router, redirect]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      if (redirect) {
        router.push(redirect);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/signin-page.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Optional overlay for readability */}
      <div className="relative w-11/12 max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center text-center md:text-left text-white">
          <h1 className="text-8xl font-bebas font-bold mb-4">Let's get you signed in!</h1>
          <p className="text-xl">We know you're bored of ranked. Let's step it up!</p>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md text-black">
          <h1 className="text-5xl font-semibold text-center font-bebas">Sign In</h1>
          <form onSubmit={handleEmailSignIn} className="mt-8">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white transition duration-300 font-bold py-2 px-4 rounded-md mt-4 hover:bg-blue-800"
            >
              Log In
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/reset-password" className="text-blue-500 hover:underline">Forgot password?</Link>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <span className="h-px w-full bg-gray-300"></span>
            <span className="px-4 text-gray-500">or</span>
            <span className="h-px w-full bg-gray-300"></span>
          </div>
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md mt-4 flex items-center justify-center hover:border-black hover:bg-gray-800 hover:text-white transition duration-200 font-bold"
          >
            <img
              src="/google-icon.svg"
              alt="Google Icon"
              className="w-6 h-6 mr-2"
            />
            Sign in with Google
          </button>
          <div className="mt-4 text-center">
            <Link href="/signup" className="text-blue-500 hover:text-red-500 transition duration-300">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
