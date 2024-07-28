'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebaseConfig';
import { doc, updateDoc, arrayUnion, collection, getDoc, addDoc, setDoc } from 'firebase/firestore';
import { getTournamentById } from '../../lib/tournamentService';

const TournamentPage = ({ params }) => {
  const router = useRouter();
  const { tournamentId } = params;
  const [activeTab, setActiveTab] = useState('details');
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(tournamentId);
        if (data) {
          setTournament(data);
        } else {
          console.error('Tournament data not found');
          setTournament(null);
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setTournament(null);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (tournament === null) {
    return <p>Tournament data not found</p>;
  }

  const handleRegisterClick = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to register');
      router.push('/signin'); // Redirect to the sign-in page
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const username = userDoc.data().username; // Ensure username is being used

      const registrationsRef = collection(db, 'tournaments', tournamentId, 'registrations');
      const registrationData = {
        teamCaptainId: user.uid,
        teamCaptainUsername: username,
        lineup: [
          {
            userId: user.uid,
            username: username,
            status: 'confirmed',
            rank: '',
            numericRank: '',
            rankProof: '',
            servers: [],
          },
          null,
          null,
          null,
          null,
        ],
      };
      const registrationDoc = await addDoc(registrationsRef, registrationData);
      const registrationId = registrationDoc.id;

      // Add tournament to MyTournaments sub-collection
      const myTournamentsRef = collection(db, 'users', user.uid, 'MyTournaments');
      await setDoc(doc(myTournamentsRef, tournamentId), {
        tournamentId: tournamentId,
        teamId: registrationId,
        name: tournament.name,
        date: tournament.date,
      });

      alert('Registered successfully!');
      router.push(`/tournaments/${tournamentId}/team/${registrationId}`);
    } catch (error) {
      console.error('Error registering for tournament:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Game & Region</h2>
            <p className="text-lg">{tournament.game}</p>
            <p className="text-lg">This tournament is only open for players in these regions:</p>
            <div className="flex space-x-4 mb-4">
              {tournament.allowedRegions && tournament.allowedRegions.map((region, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span role="img" aria-label={region} className="text-2xl">{/* Add appropriate flag emoji here */}</span>
                  <span>{region}</span>
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bebas mb-2">Date & Time</h2>
            <p className="text-lg">{new Date(tournament.date.seconds * 1000).toLocaleString()}</p>
            <p className="text-lg mb-4">{tournament.startTime}</p>
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
              {tournament.rules && tournament.rules.map((rule, index) => (
                <li key={index} className="text-lg">{rule}</li>
              ))}
            </ul>
          </div>
        );
      case 'prizes':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Prizes</h2>
            <p className="text-lg">{tournament.prizes}</p>
          </div>
        );
      case 'schedule':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Schedule</h2>
            <p className="text-lg">{tournament.schedule}</p>
          </div>
        );
      case 'contact':
        return (
          <div>
            <h2 className="text-2xl font-bebas mb-2">Contact</h2>
            <p className="text-lg">{tournament.contact}</p>
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

  return (
    <div className="container mx-auto my-8 relative">
      <div className="bg-white text-black p-8 rounded-md">
        <h1 className="text-4xl font-bebas mb-4">{tournament.name || 'Tournament'}</h1>
        <div className="flex mb-8">
          <div className="w-1/2 pr-4">
            <img src={tournament.image || '/tournament-cards/default-tournament.png'} alt={tournament.name || 'Tournament'} className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="w-1/2 pl-4">
            <div className="flex justify-start mb-4 py-2">
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'details' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('details')}>Details</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'rules' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('rules')}>Rules</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'prizes' ? 'text-white bg-black hover:bg-black' : ''}`} onClick={() => setActiveTab('prizes')}>Prizes</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'schedule' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('schedule')}>Schedule</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'brackets' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('brackets')}>Brackets</div>
              <div className={`px-6 py-4 cursor-pointer font-rajdhani text-1xl transition duration-500 hover:bg-gray-200 border-b border-black ${activeTab === 'contact' ? 'bg-black text-white hover:bg-black' : ''}`} onClick={() => setActiveTab('contact')}>Contact</div>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 right-8">
        <button
          onClick={handleRegisterClick}
          className="bg-black text-white px-6 py-4 rounded-md hover:bg-red-600 transition-all duration-500 font-bebas text-2xl"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default TournamentPage;
