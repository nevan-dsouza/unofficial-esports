'use client';

import React from 'react';
import Link from 'next/link';

const TournamentsIndex = () => {
  const tournaments = [
    { id: 1, name: 'The Unofficial Open Cup', date: 'July 12, 2024', region: 'North America', format: '5v5', image: '/tournament-cards/open-cup.png' },
    { id: 2, name: 'Weekend Warriors', date: 'October 15, 2024', region: 'Europe', format: '5v5', image: '/tournament-cards/weekend-warriors.png' },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-7xl font-bebas mb-8">Tournaments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tournaments.map((tournament) => (
          <Link key={tournament.id} href={`/tournaments/${tournament.id}`} passHref className="block bg-black border-4 border-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-500 ease-in-out hover:bg-white hover:text-black">
              <div className="relative h-0 pb-[100%]">
                <img src={tournament.image} alt={tournament.name} className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"/>
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bebas mb-2">{tournament.name}</h2>
                <p className="text-lg font-rajdhani">{tournament.date}</p>
                <p className="text-lg font-rajdhani">{tournament.region}</p>
              </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TournamentsIndex;
