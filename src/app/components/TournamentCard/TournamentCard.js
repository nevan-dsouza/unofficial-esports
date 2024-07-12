import React from 'react';
import Link from 'next/link';

const TournamentCard = ({ tournament }) => {
  return (
    <div className="card">
      <h2>{tournament.name}</h2>
      <p>Region: {tournament.region}</p>
      <p>Starts: {new Date(tournament.startDate).toLocaleString()}</p>
      <Link href={`/tournaments/${tournament.id}`}>
        <a>View Details</a>
      </Link>
    </div>
  );
};

export default TournamentCard;
