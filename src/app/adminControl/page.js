'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust this import path if needed

export default function AdminControlPage() {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    name: '',
    game: '',
    date: '',
    format: '',
    region: ''
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
    setNewTournament({ name: '', game: '', date: '', format: '', region: '' });
    fetchTournaments();
  };

  const removeTournament = async (id) => {
    await deleteDoc(doc(db, 'tournaments', id));
    fetchTournaments();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Control</h1>
      
      <form onSubmit={addTournament} className="mb-8">
        <input name="name" value={newTournament.name} onChange={handleInputChange} placeholder="Tournament Name" required className="mb-2 w-full p-2 border rounded text-black" />
        <input name="game" value={newTournament.game} onChange={handleInputChange} placeholder="Game" required className="mb-2 w-full p-2 border rounded text-black" />
        <input name="date" value={newTournament.date} onChange={handleInputChange} placeholder="Date" type="date" required className="mb-2 w-full p-2 border rounded text-black" />
        <input name="format" value={newTournament.format} onChange={handleInputChange} placeholder="Format" required className="mb-2 w-full p-2 border rounded text-black" />
        <input name="region" value={newTournament.region} onChange={handleInputChange} placeholder="Region" required className="mb-2 w-full p-2 border rounded text-black" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Tournament</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{tournament.name}</h2>
            <p>Game: {tournament.game}</p>
            <p>Date: {tournament.date}</p>
            <p>Format: {tournament.format}</p>
            <p>Region: {tournament.region}</p>
            <div className="flex flex-wrap gap-2 mt-2">
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