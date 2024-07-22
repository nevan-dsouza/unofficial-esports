'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust this import based on your Firebase setup

const TournamentManager = () => {
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
    const tournamentList = tournamentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTournaments(tournamentList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTournament(prev => ({ ...prev, [name]: value }));
  };

  const addTournament = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'tournaments'), newTournament);
    setNewTournament({ name: '', game: '', date: '', format: '', region: '' });
    fetchTournaments();
  };

  const removeTournament = async (id) => {
    await deleteDoc(doc(db, 'tournaments', id));
    fetchTournaments();
  };

  return (
    <div>
      <h1>Tournament Manager</h1>
      
      <form onSubmit={addTournament}>
        <input name="name" value={newTournament.name} onChange={handleInputChange} placeholder="Tournament Name" required />
        <input name="game" value={newTournament.game} onChange={handleInputChange} placeholder="Game" required />
        <input name="date" value={newTournament.date} onChange={handleInputChange} placeholder="Date" type="date" required />
        <input name="format" value={newTournament.format} onChange={handleInputChange} placeholder="Format" required />
        <input name="region" value={newTournament.region} onChange={handleInputChange} placeholder="Region" required />
        <button type="submit">Add Tournament</button>
      </form>

      <div className="tournament-list">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="tournament-card">
            <h2>{tournament.name}</h2>
            <p>Game: {tournament.game}</p>
            <p>Date: {tournament.date}</p>
            <p>Format: {tournament.format}</p>
            <p>Region: {tournament.region}</p>
            <Link href={`/groupInterface/${tournament.id}`}>
              <button>Team Formation</button>
            </Link>
            <button onClick={() => removeTournament(tournament.id)}>Remove Tournament</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentManager;