'use client';

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/authContext';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

const UsernamePage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSetUsername = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Username already taken');
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username,
        signInMethod: 'google'
      });

      router.push('/profile');
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/wallpaper-yoru.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Optional overlay for readability */}
      <div className="relative w-11/12 max-w-md mx-auto z-10 bg-white p-8 rounded-md shadow-md text-black">
        <h1 className="text-5xl font-semibold text-center font-bebas">Set Your Username</h1>
        <form onSubmit={handleSetUsername} className="mt-8">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white transition duration-300 font-bold py-2 px-4 rounded-md mt-4 hover:bg-blue-800"
          >
            Save Username
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernamePage;
