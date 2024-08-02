'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, limit, startAfter, query } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the import path as necessary

const StandingsPage = () => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (nextPage = false) => {
    let q;
    if (nextPage && lastVisible) {
      q = query(
        collection(db, 'users'),
        orderBy('tournamentsWon', 'desc'),
        orderBy('tournamentsPlayed', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );
    } else {
      q = query(
        collection(db, 'users'),
        orderBy('tournamentsWon', 'desc'),
        orderBy('tournamentsPlayed', 'desc'),
        limit(10)
      );
    }

    const querySnapshot = await getDocs(q);
    const newUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

    if (nextPage) {
      setUsers(prevUsers => [...prevUsers, ...newUsers]);
    } else {
      setUsers(newUsers);
    }

    // Calculate total pages for pagination
    const totalDocs = querySnapshot.size;
    const totalPages = Math.ceil(totalDocs / 10);
    setTotalPages(totalPages);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleNextPage = () => {
    fetchUsers(true);
    setPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setUsers([]);
    setPage(prevPage => Math.max(prevPage - 1, 1));
    fetchUsers();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-6xl font-bebas mb-8">Standings</h1>
      <div className="overflow-x-auto w-full flex flex-col items-center">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-red-500 text-white">
            <tr className='text-4xl font-bebas'>
              <th className="px-6 py-4 border-b border-gray-300 text-center">Rank</th>
              <th className="px-6 py-4 border-b border-gray-300 text-center">Username</th>
              <th className="px-6 py-4 border-b border-gray-300 text-center">Tournaments Played</th>
              <th className="px-6 py-4 border-b border-gray-300 text-center">Tournaments Won</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="border-b border-gray-300 text-black text-center text-3xl font-bebas hover:bg-gray-200 transition duration-300">
                <td className="px-6 py-4">{(page - 1) * 10 + index + 1}</td>
                <td className="px-6 py-4">{user.username || 'N/A'}</td>
                <td className="px-6 py-4">{user.tournamentsPlayed || 0}</td>
                <td className="px-6 py-4">{user.tournamentsWon || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-6 w-full max-w-md mx-auto">
        <button 
          onClick={handlePreviousPage} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer transition duration-300"
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="self-center text-lg">{`Page ${page} of ${totalPages}`}</span>
        <button 
          onClick={handleNextPage} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer transition duration-300"
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StandingsPage;