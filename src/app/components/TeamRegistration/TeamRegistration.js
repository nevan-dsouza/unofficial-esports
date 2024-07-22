'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TeamRegistration = ({ tournamentId }) => {
  const [team, setTeam] = useState([null, null, null, null, null]);
  const [pendingInvites, setPendingInvites] = useState([false, false, false, false, false]);
  const router = useRouter();

  const handleInvite = async (index) => {
    const email = prompt('Enter player email:');
    if (email) {
      const updatedTeam = [...team];
      updatedTeam[index] = { email, status: 'pending' };
      setTeam(updatedTeam);

      const updatedPendingInvites = [...pendingInvites];
      updatedPendingInvites[index] = true;
      setPendingInvites(updatedPendingInvites);
    }
  };

  const handleCancelInvite = (index) => {
    const updatedTeam = [...team];
    updatedTeam[index] = null;
    setTeam(updatedTeam);

    const updatedPendingInvites = [...pendingInvites];
    updatedPendingInvites[index] = false;
    setPendingInvites(updatedPendingInvites);
  };

  const handleSubmitTeam = async () => {
    try {
      await addDoc(collection(db, 'teams'), {
        tournamentId,
        teamMembers: team,
        timestamp: serverTimestamp(),
      });
      alert('Team submitted successfully!');
      router.push('/tournaments');
    } catch (error) {
      console.error('Error submitting team:', error);
    }
  };

  const handleLeaveTeam = () => {
    if (confirm('Are you sure you want to leave the team?')) {
      router.push('/tournaments');
    }
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-md shadow-lg text-black">
      <h1 className="text-5xl font-semibold text-center font-bebas mb-8">Register Team</h1>
      <div className="grid grid-cols-1 gap-4">
        {team.map((member, index) => (
          <div key={index} className="flex justify-between items-center p-4 border rounded-md">
            {member ? (
              <div className="flex-grow">
                <p className="text-lg">{member.email}</p>
                <p className="text-sm text-gray-500">{member.status}</p>
              </div>
            ) : (
              <p className="text-lg text-gray-400">Empty Slot</p>
            )}
            {pendingInvites[index] ? (
              <button
                onClick={() => handleCancelInvite(index)}
                className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => handleInvite(index)}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Invite
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={handleLeaveTeam}
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-700"
        >
          Leave Team
        </button>
        <button
          onClick={handleSubmitTeam}
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Submit Team
        </button>
      </div>
    </div>
  );
};

export default TeamRegistration;
