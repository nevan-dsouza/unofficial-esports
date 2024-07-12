'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
    // Add more fields as needed
  });

  useEffect(() => {
    // Fetch user data from API or context
    const fetchUserData = async () => {
      // Replace with your actual API call
      const userData = await fakeApiCall();
      setUser(userData);
      setFormData({
        username: userData.username,
        email: userData.email,
        // Populate more fields as needed
      });
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    // Save updated user data to API
    // Replace with your actual API call
    await fakeApiSave(formData);
    setUser(formData);
    setIsEditing(false);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-md shadow-lg">
      <div className="flex items-center mb-8">
        <img src={user.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover mr-8" />
        <h1 className="text-6xl font-bold font-bebas text-black">{user.username}</h1>
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
                />
              </label>
              {/* Add more fields as needed */}
              <button onClick={handleSave} className="bg-white text-black px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-300 mt-4">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-300 mt-4 ml-4">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-2">Username: {user.username}</p>
              <p className="text-lg mb-2">Email: {user.email}</p>
              {/* Display more fields as needed */}
              <button onClick={() => setIsEditing(true)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-300 mt-4">
                Edit Profile
              </button>
            </div>
          )}
        </div>
        <div className="col-span-1 bg-black p-6 rounded-xl text-white">
          <h2 className="text-4xl font-semibold mb-4 font-bebas">Statistics</h2>
          <p className="text-lg mb-2">Tournaments Played: {user.stats.tournamentsPlayed}</p>
          <p className="text-lg mb-2">Tournaments Won: {user.stats.tournamentsWon}</p>
          {/* Add more statistics as needed */}
        </div>
      </div>
      <div className="bg-gray-100 p-6 rounded-xl mb-8 text-black">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          {user.rewards.map((reward, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold font-bebas">{reward.title}</h3>
              <p className="text-lg">{reward.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-black p-6 rounded-md text-white">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Settings</h2>
        {/* Add settings options as needed */}
      </div>
    </div>
  );
};

// Fake API call for demonstration purposes
const fakeApiCall = async () => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        username: 'JohnDoe',
        email: 'john.doe@example.com',
        profilePicture: '/profile/profile-pic.png',
        stats: {
          tournamentsPlayed: 10,
          tournamentsWon: 5,
        },
        rewards: [
          { title: 'Champion', description: 'Won the 2024 Summer Cup' },
          { title: 'MVP', description: 'Most Valuable Player of 2023' },
          // Add more rewards as needed
        ],
      });
    }, 1000)
  );
};

// Fake API save for demonstration purposes
const fakeApiSave = async (data) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(data);
    }, 1000)
  );
};

export default ProfilePage;
