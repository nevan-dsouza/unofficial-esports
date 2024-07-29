'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the import path as necessary

const StandingsPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('tournamentsWon', 'desc'), orderBy('tournamentsPlayed', 'desc'));
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching user standings:', error);
      }
    };

    fetchStandings();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-6xl font-bebas mb-8">Standings</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th className="text-3xl py-2 px-4 border-b border-gray-200 font-bebas">Rank</th>
              <th className="text-3xl py-2 px-4 border-b border-gray-200 font-bebas">Username</th>
              <th className="text-3xl py-2 px-4 border-b border-gray-200 font-bebas">Tournaments Played</th>
              <th className="text-3xl py-2 px-4 border-b border-gray-200 font-bebas">Tournaments Won</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="text-center">
                <td className="text-1xl py-2 px-4 border-b border-gray-200">{index + 1}</td>
                <td className="text-1xl py-2 px-4 border-b border-gray-200">{user.username}</td>
                <td className="text-1xl py-2 px-4 border-b border-gray-200">{user.tournamentsPlayed || 0}</td>
                <td className="text-1xl py-2 px-4 border-b border-gray-200">{user.tournamentsWon || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsPage;
