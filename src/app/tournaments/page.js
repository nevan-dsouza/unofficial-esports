'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the path as necessary
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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

const TournamentsIndex = () => {
  const [tournaments, setTournaments] = useState([]);
  const [scrollPositions, setScrollPositions] = useState({});

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

  const handleScroll = (category, direction) => {
    const container = document.getElementById(`category-${category}`);
    const newScrollPositions = { ...scrollPositions };

    if (direction === 'left') {
      newScrollPositions[category] = (newScrollPositions[category] || 0) - container.offsetWidth;
    } else {
      newScrollPositions[category] = (newScrollPositions[category] || 0) + container.offsetWidth;
    }

    container.scrollTo({
      left: newScrollPositions[category],
      behavior: 'smooth'
    });

    setScrollPositions(newScrollPositions);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-7xl font-bebas mb-8">Tournaments</h1>
      {categories.filter(category => tournaments.some(tournament => tournament.category === category)).map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-5xl font-bebas mb-4">{category}</h2>
          <div className="relative">
            <FaArrowLeft
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-3xl cursor-pointer"
              onClick={() => handleScroll(category, 'left')}
            />
            <div
              id={`category-${category}`}
              className="flex space-x-4 overflow-x-auto scrollbar-hide"
            >
              {tournaments.filter(tournament => tournament.category === category).map((tournament) => (
                <Link key={tournament.id} href={`/tournaments/${tournament.id}`} passHref>
                  <div className="min-w-[250px] bg-black border-4 border-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-500 ease-in-out hover:bg-white hover:text-black">
                    <div className="relative h-0 pb-[100%]">
                      <img src={tournament.image || '/tournament-cards/default-tournament.png'} alt={tournament.name} className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"/>
                    </div>
                    <div className="p-4">
                      <h3 className="text-2xl font-bebas mb-2">{tournament.name}</h3>
                      <p className="text-lg font-rajdhani">{new Date(tournament.date.seconds * 1000).toLocaleDateString()}</p>
                      <p className="text-lg font-rajdhani">{tournament.region}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <FaArrowRight
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-3xl cursor-pointer"
              onClick={() => handleScroll(category, 'right')}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentsIndex;
