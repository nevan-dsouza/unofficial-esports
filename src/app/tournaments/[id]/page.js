'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import BracketGenerator from '../../BracketGenerator';

const TournamentPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [activeTab, setActiveTab] = useState('details');
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);
  // const [bracketData, setBracketData] = useState(null);

  const tournaments = {
    1: { name: 'The Unofficial Open Cup', date: 'July 12, 2024', region: 'North America', format: '5v5', image: '/tournament-cards/open-cup.png' },
    2: { name: 'Weekend Warriors', date: 'October 15, 2024', region: 'Europe', format: '5v5', image: '/tournament-cards/weekend-warriors.png' },
  };

  const tournament = tournaments[id] || {};

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Game & Region</h2>
            <p className="text-lg">VALORANT</p>
            <p className="text-lg">This tournament is only open for players in these regions:</p>
            <div className="flex space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <span role="img" aria-label="Canada" className="text-2xl">🇨🇦</span>
                <span>Canada</span>
              </div>
              <div className="flex items-center space-x-2">
                <span role="img" aria-label="USA" className="text-2xl">🇺🇸</span>
                <span>United States of America</span>
              </div>
            </div>
            <h2 className="text-2xl font-bebas mb-2">Date & Time</h2>
            <p className="text-lg">{tournament.date}</p>
            <p className="text-lg mb-4">6:00 PM EDT</p>
            <h2 className="text-2xl font-bebas mb-2">Format</h2>
            <p className="text-lg">{tournament.format}</p>
            <p className="text-lg">Team Registration is allowed</p>
          </div>
        );
      case 'rules':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Rules</h2>
            <ul className="list-disc pl-6">
              <li className="text-lg">All participants must adhere to the code of conduct.</li>
              <li className="text-lg">Matches must be played at the scheduled times.</li>
              <li className="text-lg">Cheating and exploiting bugs are strictly prohibited.</li>
            </ul>
          </div>
        );
      case 'prizes':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Prizes</h2>
            <p className="text-lg">The winning team will receive exclusive in-game items and a cash prize.</p>
          </div>
        );
      case 'schedule':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Schedule</h2>
            <p className="text-lg">Check-in begins at 9:00 AM. Matches start at 10:00 AM.</p>
          </div>
        );
      case 'contact':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Contact</h2>
            <p className="text-lg">Join our <a href="https://discord.gg/yourdiscordlink" className="text-blue-500 hover:underline">Discord server</a> for updates and support.</p>
          </div>
        );
      case 'brackets':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Brackets</h2>
            <p className="text-lg">This is the brackets page</p>
          </div>
        );
      default:
        return null;
    }
  };

  const handleRegisterClick = () => {
    setShowRegisterOptions(true);
  };

  const handleSoloRegister = () => {
    router.push(`/register/solo?tournamentId=${id}`);
  };

  const handleTeamRegister = () => {
    router.push(`/register/team?tournamentId=${id}`);
  };

  // const generateBrackets = () => {
  //   // Mock data for the example
  //   const rounds = [
  //     {
  //       title: 'Round 1',
  //       seeds: [
  //         {
  //           id: 1,
  //           teams: [
  //             { id: 'teamA', name: 'Team A' },
  //             { id: 'teamB', name: 'Team B' },
  //           ],
  //         },
  //         {
  //           id: 2,
  //           teams: [
  //             { id: 'teamC', name: 'Team C' },
  //             { id: 'teamD', name: 'Team D' },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Round 2',
  //       seeds: [
  //         {
  //           id: 3,
  //           teams: [
  //             { id: 'winner1', name: 'Winner Match 1' },
  //             { id: 'winner2', name: 'Winner Match 2' },
  //           ],
  //         },
  //       ],
  //     },
  //   ];
  //   setBracketData(rounds);
  // };

  // useEffect(() => {
  //   generateBrackets();
  // }, []);

  return (
    <div className="container mx-auto my-8 relative">
      <div className="bg-white text-black p-8 rounded-md">
        <h1 className="text-4xl font-bebas mb-4">{tournament.name}</h1>
        <div className="flex mb-8">
          <div className="w-1/2 pr-4">
            <img src={tournament.image} alt={tournament.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="w-1/2 pl-4">
            <div className="flex justify-start mb-4 py-2">
            <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'Details' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('details')}>Details</div>
            <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'Rules' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('rules')}>Rules</div>
            <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'Prizes' ? 'text-white bg-black hover:bg-black' : ''}`} onClick={() => setActiveTab('prizes')}>Prizes</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'schedule' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'Brackets' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('brackets')}>Brackets</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'contact' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('contact')}>Contact</div>
            </div>
            {renderContent()}
          </div>
        </div>
        {/* <div className="mt-12">
          {bracketData && <BracketGenerator rounds={bracketData} />}
        </div> */}
      </div>
      <div className="absolute bottom-8 right-8">
        {!showRegisterOptions && (
          <button
            onClick={handleRegisterClick}
            className="bg-black text-white px-6 py-4 rounded-md hover:bg-red-600 transition-all duration-500 font-bebas text-2xl"
          >
            Register
          </button>
        )}
        {showRegisterOptions && (
          <div className="flex space-x-4 transition-all duration-300">
            <button
              onClick={handleSoloRegister}
              className="bg-black text-white px-6 py-4 rounded-md hover:bg-red-600 transition-all duration-300 font-bebas text-2xl"
            >
              Register Solo
            </button>
            <button
              onClick={handleTeamRegister}
              className="bg-black text-white px-6 py-4 rounded-md hover:bg-red-600 transition-all duration-300 font-bebas text-2xl"
            >
              Register Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;
