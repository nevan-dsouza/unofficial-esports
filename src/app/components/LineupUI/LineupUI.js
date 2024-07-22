'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal/Modal';
import { db } from '../../lib/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const LineupUI = ({ tournamentId }) => {
  const [team, setTeam] = useState([null, null, null, null, null]);
  const [pendingInvites, setPendingInvites] = useState([false, false, false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [activeTab, setActiveTab] = useState('email'); // Add this state

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const fetchUsername = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedTeam = [...team];
          updatedTeam[0] = { email: user.email, username: userData.username, status: 'confirmed' };
          setTeam(updatedTeam);
        }
      };
      fetchUsername();
    }
  }, []);

  const handleInvite = (index) => {
    setCurrentIndex(index);
    setShowModal(true);
  };

  const handleConfirmInvite = async () => {
    if (inputValue) {
      let updatedTeam = [...team];

      try {
        if (activeTab === 'email') {
          const userQuery = query(collection(db, 'users'), where('email', '==', inputValue));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            updatedTeam[currentIndex] = { email: inputValue, username: userData.username, status: 'pending' };
            setTeam(updatedTeam);
          } else {
            alert('Email not found.');
            return;
          }
        } else if (activeTab === 'username') {
          const userQuery = query(collection(db, 'users'), where('username', '==', inputValue));
          const querySnapshot = await getDocs(userQuery);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            updatedTeam[currentIndex] = { email: userData.email, username: inputValue, status: 'pending' };
            setTeam(updatedTeam);
          } else {
            alert('Username not found.');
            return;
          }
        }

        const updatedPendingInvites = [...pendingInvites];
        updatedPendingInvites[currentIndex] = true;
        setPendingInvites(updatedPendingInvites);
        setShowModal(false);
        setInputValue('');
      } catch (error) {
        console.error('Error inviting user:', error);
      }
    }
  };

  const handleGenerateLink = async () => {
    const link = `${window.location.origin}/invite/${tournamentId}/${currentIndex}`;
    setShareableLink(link);
    await addDoc(collection(db, 'invitations'), {
      tournamentId,
      teamIndex: currentIndex,
      link,
      timestamp: serverTimestamp(),
    });
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
    } catch (error) {
      console.error('Error submitting team:', error);
    }
  };

  return (
    <div className="container mx-auto my-8 p-8 rounded-3xl shadow-lg border border-black relative">
      <div className="absolute inset-0 rounded-3xl bg-cover bg-center" style={{ backgroundImage: "url('/lineup-card-bg.png')" }}></div>
      <div className="absolute inset-0 rounded-3xl bg-black opacity-70"></div>
      <div className="relative z-10">
        <h1 className="text-7xl font-semibold text-center font-bebas mb-8 text-white">My Lineup</h1>
        <div className="grid grid-cols-1 gap-4 mx-auto max-w-2xl">
          {team.map((member, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-6 border rounded-lg shadow-md transition-all duration-700 ease-in-out ${
                member?.status === 'pending'
                  ? 'bg-gradient-to-r from-white to-yellow-300'
                  : member?.status === 'confirmed'
                  ? 'bg-gradient-to-r from-white to-green-600'
                  : 'bg-gray-50'
              }`}
            >
              {member ? (
                <div className="flex-grow">
                  <p className="text-2xl font-semibold font-bebas">{member.username}</p>
                  <p className="text-gray-500 font-bebas text-2xl">{member.status}</p>
                </div>
              ) : (
                <p className="text-lg text-gray-400">Empty Slot</p>
              )}
              {pendingInvites[index] && index !== 0 ? (
                <button
                  onClick={() => handleCancelInvite(index)}
                  className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Cancel
                </button>
              ) : index !== 0 ? (
                <button
                  onClick={() => handleInvite(index)}
                  className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 inline-block mr-2"
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
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <button
            onClick={() => alert('Are you sure you want to leave the team?')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Leave Team
          </button>
          <button
            onClick={handleSubmitTeam}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Submit Team
          </button>
        </div>
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Invite Player"
          onConfirm={handleConfirmInvite}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleGenerateLink={handleGenerateLink}
          shareableLink={shareableLink}
          activeTab={activeTab}
          setActiveTab={setActiveTab} // Pass this prop
        />
      </div>
    </div>
  );
};

export default LineupUI;
