'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust this import path if needed

const categories = [
  'Beginner Tournaments',
  'Intermediate Tournaments',
  'Expert Tournaments',
  'Region-Specific Tournaments',
  'Solo/Duo/Team Tournaments',
  'Themed Tournaments',
  'Seasonal Tournaments',
  'Invitational Tournaments',
  'Charity Tournaments',
  'Sponsored Tournaments'
];

export default function AdminControlPage() {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    game: '',
    date: '',
    format: '',
    region: '',
    category: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    const tournamentsCollection = collection(db, 'tournaments');
    const tournamentSnapshot = await getDocs(tournamentsCollection);
    const tournamentList = tournamentSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Timestamp to string
      const date = data.date instanceof Timestamp ? data.date.toDate().toLocaleDateString() : data.date;
      return {
        id: doc.id,
        ...data,
        date
      };
    });
    setTournaments(tournamentList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTournament(prev => ({ ...prev, [name]: value }));
  };

  const addTournament = async (e) => {
    e.preventDefault();
    // Convert date string to Firestore Timestamp
    const tournamentData = {
      ...newTournament,
      date: Timestamp.fromDate(new Date(newTournament.date))
    };
    await addDoc(collection(db, 'tournaments'), tournamentData);
    setNewTournament({ name: '', game: '', date: '', format: '', region: '', category: '' });
    fetchTournaments();
  };

  const removeTournament = async (id) => {
    await deleteDoc(doc(db, 'tournaments', id));
    fetchTournaments();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-6xl font-bold mb-8 text-center font-bebas">Admin Control</h1>
      
      <form onSubmit={addTournament} className="mb-8 bg-white shadow-lg rounded-lg p-6 text-black">
        <h2 className="text-2xl font-semibold mb-4">Add New Tournament</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={newTournament.name}
            onChange={handleInputChange}
            placeholder="Tournament Name"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="game"
            value={newTournament.game}
            onChange={handleInputChange}
            placeholder="Game"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="date"
            value={newTournament.date}
            onChange={handleInputChange}
            placeholder="Date"
            type="date"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="format"
            value={newTournament.format}
            onChange={handleInputChange}
            placeholder="Format"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="region"
            value={newTournament.region}
            onChange={handleInputChange}
            placeholder="Region"
            required
            className="p-2 border rounded text-black"
          />
          <select
            name="category"
            value={newTournament.category}
            onChange={handleInputChange}
            required
            className="p-2 border rounded text-black"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Tournament</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="border p-6 rounded-lg shadow-lg bg-white text-black">
            <h2 className="text-3xl font-semibold mb-2 font-bebas">{tournament.name}</h2>
            <p className="text-gray-700 mb-1"><strong>Game:</strong> {tournament.game}</p>
            <p className="text-gray-700 mb-1"><strong>Date:</strong> {tournament.date}</p>
            <p className="text-gray-700 mb-1"><strong>Format:</strong> {tournament.format}</p>
            <p className="text-gray-700 mb-1"><strong>Region:</strong> {tournament.region}</p>
            <p className="text-gray-700 mb-1"><strong>Category:</strong> {tournament.category}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`/groupInterface/${tournament.id}`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Team Formation</button>
              </Link>
              <Link href={`/bracketManagement/${tournament.id}`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Bracket Management</button>
              </Link>
              <button onClick={() => removeTournament(tournament.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Tournament</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
