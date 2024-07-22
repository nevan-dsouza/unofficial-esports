// src/app/profile/page.js
'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/authContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarURL, setAvatarURL] = useState('/profile/default-avatar.png');
  const [hovering, setHovering] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            username: userData.username,
            email: user.email,
          });
          if (userData.photoURL) {
            setAvatarURL(userData.photoURL);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: formData.username,
      });
      if (avatar) {
        const storage = getStorage();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, avatar);
        const photoURL = await getDownloadURL(avatarRef);
        await updateDoc(userRef, { photoURL });
        setAvatarURL(photoURL);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-md shadow-lg">
      <div className="flex items-center mb-8">
        <div
          className="relative w-32 h-32"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <img src={avatarURL} alt="Profile" className="w-32 h-32 rounded-full object-cover mr-4 border border-black" />
          {hovering && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded-full">
              <label className="cursor-pointer text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536M16 4h4v4M4 20h16v2H4a2 2 0 01-2-2V4a2 2 0 012-2h8l4 4H4v14z"
                  />
                </svg>
                <input type="file" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-5xl font-bold font-bebas text-black mx-2">@{formData.username}</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-white">
        <div className="col-span-1 bg-black p-6 rounded-xl text-white">
          <h2 className="text-4xl font-semibold mb-4 font-bebas">User Details</h2>
          {isEditing ? (
            <div>
              <label className="block mb-2">
                Username
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-black"
                />
              </label>
              <label className="block mb-2">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-black"
                  readOnly
                />
              </label>
              <button onClick={handleSave} className="bg-white text-black px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-300 mt-4">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-300 mt-4 ml-4">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-2">Username: {formData.username}</p>
              <p className="text-lg mb-2">Email: {formData.email}</p>
              <button onClick={() => setIsEditing(true)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-300 mt-4">
                Edit Profile
              </button>
            </div>
          )}
        </div>
        <div className="col-span-1 bg-black p-6 rounded-xl text-white">
          <h2 className="text-4xl font-semibold mb-4 font-bebas">Statistics</h2>
          <p className="text-lg mb-2">Tournaments Played: {user.stats?.tournamentsPlayed || 0}</p>
          <p className="text-lg mb-2">Tournaments Won: {user.stats?.tournamentsWon || 0}</p>
        </div>
      </div>
      <div className="bg-gray-100 p-6 rounded-xl mb-8 text-black">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          {user.rewards?.map((reward, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold font-bebas">{reward.title}</h3>
              <p className="text-lg">{reward.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-black p-6 rounded-md text-white">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Settings</h2>
        <button onClick={handleLogout} className="bg-white text-black font-bold px-6 py-2 rounded-md hover:bg-red-700 hover:text-white transition-all duration-300 mt-4">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
