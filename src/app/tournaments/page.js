// src/app/tournaments/page.js

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the path as necessary

const TournamentsIndex = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournamentsCollection = collection(db, 'tournaments');
        const tournamentSnapshot = await getDocs(tournamentsCollection);
        const tournamentList = tournamentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTournaments(tournamentList);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-7xl font-bebas mb-8">Tournaments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} href={`/tournaments/${tournament.id}`} passHref>
            <div className="block bg-black border-4 border-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-500 ease-in-out hover:bg-white hover:text-black">
              <div className="relative h-0 pb-[100%]">
                <img src={tournament.image || '/tournament-cards/default-tournament.png'} alt={tournament.name} className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"/>
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bebas mb-2">{tournament.name}</h2>
                <p className="text-lg font-rajdhani">{new Date(tournament.date.seconds * 1000).toLocaleDateString()}</p>
                <p className="text-lg font-rajdhani">{tournament.region}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TournamentsIndex;
