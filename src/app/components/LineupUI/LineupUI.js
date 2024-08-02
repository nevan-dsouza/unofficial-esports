'use client';

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebaseConfig';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from '../Modal/Modal';
import { differenceInSeconds } from 'date-fns';

const LineupUI = ({ tournamentId, teamId }) => {
  const storage = getStorage();
  const ranks = [
    { label: 'Iron', value: 5 },
    { label: 'Bronze', value: 10 },
    { label: 'Silver', value: 15 },
    { label: 'Gold', value: 20 },
    { label: 'Platinum', value: 25 },
    { label: 'Diamond', value: 30 },
    { label: 'Ascendant', value: 35 },
    { label: 'Immortal', value: 40 },
    { label: 'Radiant', value: 45 }
  ];
  const servers = ['US West (Oregon)', 'US West (N. California)', 'US East (N. Virginia)', 'US Central (Texas)', 'US Central (Illinois)', 'US Central (Georgia)'];

  const [team, setTeam] = useState([null, null, null, null, null]);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(null);
  const [userData, setUserData] = useState({
    rank: '',
    numericRank: '',
    rankProof: '',
    servers: [],
  });
  const [teamCaptainId, setTeamCaptainId] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [activeTab, setActiveTab] = useState('username');
  const [tournament, setTournament] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUsername(userData.username); // Fetch and set the username
        }
      }
    };
    fetchCurrentUser();
  }, [currentUser]);

  useEffect(() => {
    const fetchTournamentData = async () => {
      const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (tournamentDoc.exists()) {
        const tournamentData = tournamentDoc.data();
        setTournament(tournamentData);
        if (tournamentData.date) {
          setDeadline(new Date(tournamentData.date.seconds * 1000));
        } else {
          console.error('Date is not defined');
        }
      } else {
        console.error('Tournament document does not exist');
      }
    };
    fetchTournamentData();
  }, [tournamentId]);

  useEffect(() => {
    if (deadline) {
      const intervalId = setInterval(() => {
        const now = new Date();
        const difference = differenceInSeconds(deadline, now);

        if (difference <= 0) {
          clearInterval(intervalId);
          setCountdown('Registration has closed.');
        } else {
          const days = Math.floor(difference / (3600 * 24));
          const hours = Math.floor((difference % (3600 * 24)) / 3600);
          const minutes = Math.floor((difference % 3600) / 60);
          const seconds = difference % 60;
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [deadline]);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            rank: data.rank || '',
            numericRank: data.numericRank || '',
            rankProof: data.rankProof || '',
            servers: data.servers || [],
          });
        }
      };
      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTeamData = async () => {
      const teamDoc = await getDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        setTeam(teamData.lineup);
        setTeamCaptainId(teamData.teamCaptainId);
        console.log('Fetched Team Data:', teamData.lineup);
      } else {
        console.error('Team document does not exist');
      }
    };
    fetchTeamData();
  }, [tournamentId, teamId]);

  const handleInvite = (index) => {
    setCurrentIndex(index);
    setShowModal(true);
  };

  const handleConfirmInvite = async () => {
    if (inputValue) {
      let updatedTeam = [...team];
  
      try {
        const userQuery = query(collection(db, 'users'), where('username', '==', inputValue));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const inviteeId = querySnapshot.docs[0].id;
  
          if (inviteeId === currentUser.uid || team.some(member => member?.userId === inviteeId)) {
            alert('Cannot invite yourself, an existing team member, or a pending invitee.');
            return;
          }
  
          // Check if the user is already in another team in the same tournament
          const registrationsRef = collection(db, 'tournaments', tournamentId, 'registrations');
          const q = query(registrationsRef, where('lineup', 'array-contains', { userId: inviteeId }));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            // Remove the user from the existing team
            const existingTeamDoc = querySnapshot.docs[0];
            const existingTeamData = existingTeamDoc.data();
            const updatedExistingLineup = existingTeamData.lineup.map(member =>
              member?.userId === inviteeId ? null : member
            );
  
            await updateDoc(existingTeamDoc.ref, { lineup: updatedExistingLineup });
          }
  
          updatedTeam[currentIndex] = { userId: inviteeId, username: userData.username, status: 'pending', rank: '', numericRank: '', rankProof: '', servers: [] };
  
          if (currentUsername) {
            await addDoc(collection(db, 'tournaments', tournamentId, 'invitations'), {
              inviterId: currentUser.uid,
              inviterUsername: currentUsername, 
              inviteeId,
              inviteeUsername: userData.username,
              timestamp: serverTimestamp(),
              tournamentId,
              teamId,
              status: 'pending',
            });
  
            await addDoc(collection(db, 'users', inviteeId, 'invites'), {
              inviterId: currentUser.uid,
              inviterUsername: currentUsername, 
              tournamentId,
              teamId,
              timestamp: serverTimestamp(),
              status: 'pending',
            });
  
            await updateDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId), {
              lineup: updatedTeam,
            });
  
            setTeam(updatedTeam);
            console.log('Team Data after Confirm Invite:', updatedTeam);
            setShowModal(false);
          } else {
            console.error('currentUsername is not defined');
          }
        } else {
          alert('Username not found.');
          return;
        }
      } catch (error) {
        console.error('Error inviting user:', error);
      }
    }
  };  

  const handleCancelInvite = async (index) => {
    try {
      const updatedTeam = [...team];
      const inviteeId = updatedTeam[index]?.userId;
      if (!inviteeId) return;
  
      // Remove the invite from the lineup
      updatedTeam[index] = null;
  
      // Remove the invite from the tournament invitations collection
      const invitationsQuery = query(
        collection(db, 'tournaments', tournamentId, 'invitations'),
        where('inviteeId', '==', inviteeId)
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);
      invitationsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
  
      // Remove the invite from the user's invites collection
      const userInvitesQuery = query(
        collection(db, 'users', inviteeId, 'invites'),
        where('tournamentId', '==', tournamentId)
      );
      const userInvitesSnapshot = await getDocs(userInvitesQuery);
      userInvitesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
  
      // Update the team lineup
      await updateDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId), {
        lineup: updatedTeam,
      });
  
      setTeam(updatedTeam);
      console.log('Invite canceled and team updated:', updatedTeam);
    } catch (error) {
      console.error('Error canceling invite:', error);
    }
  };
  

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/invite/${tournamentId}/${teamId}/${currentIndex}`;
    setShareableLink(link);
  };

  const handleRankChange = (e) => {
    const selectedRank = ranks.find(rank => rank.value === parseInt(e.target.value, 10));
    setUserData({
      ...userData,
      rank: selectedRank.label,
      numericRank: selectedRank.value
    });
  };

  const handleServersChange = (server) => {
    let updatedServers;
    if (userData.servers.includes(server)) {
      updatedServers = userData.servers.filter(s => s !== server);
    } else if (userData.servers.length < 2) {
      updatedServers = [...userData.servers, server];
    } else {
      updatedServers = [userData.servers[1], server];
    }
    setUserData({
      ...userData,
      servers: updatedServers
    });
  };

  const handleRankProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({
        ...userData,
        rankProof: file // Store the file object instead of the data URL
      });
    }
  };

  const handleSaveUserInfo = async () => {
    if (userData.rank && userData.numericRank && userData.rankProof && userData.servers.length === 2) {
      try {
        let rankProofUrl = userData.rankProof;
        
        // If rankProof is a File object, upload it to Firebase Storage
        if (userData.rankProof instanceof File) {
          const storageRef = ref(storage, `rankProofs/${currentUser.uid}`);
          await uploadBytes(storageRef, userData.rankProof);
          rankProofUrl = await getDownloadURL(storageRef);
        }
  
        const updatedUserData = {
          ...userData,
          rankProof: rankProofUrl // Store the download URL instead of the file data
        };
  
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, updatedUserData);
  
        const teamDoc = await getDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
        if (teamDoc.exists()) {
          const teamData = teamDoc.data();
          const updatedLineup = teamData.lineup.map(member => {
            if (member?.userId === currentUser.uid) {
              return { ...member, ...updatedUserData };
            }
            return member;
          });
  
          await updateDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId), {
            lineup: updatedLineup
          });
  
          setTeam(updatedLineup);
        }
  
        alert('User info saved successfully!');
      } catch (error) {
        console.error('Error saving user info:', error);
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const teamDoc = await getDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const updatedLineup = teamData.lineup.map(member => (member?.userId === currentUser.uid ? null : member));
  
        // Check if there are any members left in the lineup
        const hasMembers = updatedLineup.some(member => member !== null);
  
        if (hasMembers) {
          // Update the lineup with the removed member
          await updateDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId), {
            lineup: updatedLineup
          });
        } else {
          // Delete team document if no members remain
          await deleteDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
        }
  
        setTeam(updatedLineup);
  
        // Delete the MyTournament card for the user
        await deleteDoc(doc(db, 'users', currentUser.uid, 'MyTournaments', tournamentId));
        alert('You have left the team.');
        router.push('/profile');
      } else {
        console.error('Team document does not exist');
      }
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };  

  return (
    <div className="container mx-auto my-8 p-8 rounded-3xl shadow-lg border relative bg-black">
      <div className="mb-8 bg-gray-100 p-6 rounded-xl shadow-lg text-black">
        <h1 className="text-6xl font-semibold mb-4 font-bebas flex justify-center">{tournament?.name || 'Tournament Name'}</h1>
        {deadline && (
          <p className="text-3xl font-bebas mb-4 text-center">Registration Deadline: <span className='text-red-500'>{countdown}</span></p>
        )}
        <p className="text-xl font-rajdhani text-center"><span className='font-bebas text-red-500 text-2xl'>Instructions: </span>Please make sure to <strong>fill in your PLAYER INFO first</strong> and <strong>invite your team members before the deadline</strong>. Teams will be <strong>DQ'd</strong> if team members don't complete their info.</p>
      </div>
      <div className="flex space-x-8">
        <div className="w-1/3 bg-gray-100 p-6 rounded-xl shadow-lg text-black">
          <h2 className="text-6xl font-semibold mb-4 font-bebas">Player Info</h2>
          <label className="block mb-4 text-2xl font-bebas">Rank
            <select
              value={userData.numericRank}
              onChange={handleRankChange}
              className="w-full p-2 border rounded-md font-rajdhani text-lg"
            >
              <option value="">Select Rank</option>
              {ranks.map(rank => (
                <option key={rank.value} value={rank.value}>{rank.label}</option>
              ))}
            </select>
          </label>
          <label className="block mb-4 text-2xl font-bebas">Rank Proof:
            <input
              type="file"
              onChange={handleRankProofChange}
              className="w-full p-2 border rounded-md font-rajdhani text-lg"
            />
          </label>
          <label className="block mb-2 text-2xl font-bebas">Preferred Servers:
            <div className="grid grid-cols-1 gap-2">
              {servers.map(server => (
                <div key={server} className={`cursor-pointer p-1 border rounded-md font-rajdhani text-lg ${userData.servers.includes(server) ? 'border-green-500 text-black bg-white' : 'bg-white text-black'}`} onClick={() => handleServersChange(server)}>
                  {server}
                  {userData.servers.includes(server) && <span className="ml-2">✔️</span>}
                </div>
              ))}
            </div>
          </label>
          <button
            onClick={handleSaveUserInfo}
            className="bg-blue-500 text-white font-bebas text-2xl px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
        </div>

        <div className="w-2/3">
          <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
            <h1 className="text-6xl font-semibold text-center font-bebas mb-8 text-black">My Lineup</h1>
            <div className="grid grid-cols-1 gap-4 mx-auto max-w-2xl">
              {team.map((member, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg shadow-md transition-all duration-700 ease-in-out border-black ${
                    member?.status === 'pending'
                      ? 'bg-gradient-to-r from-white to-yellow-300'
                      : member?.status === 'confirmed'
                      ? 'bg-gradient-to-r from-white to-green-600'
                      : 'bg-gray-50'
                  }`}
                >
                  {member ? (
                    <div className="flex-grow">
                      <p className="text-4xl text-black font-semibold font-bebas">{member.username}</p>
                      <p className="text-gray-500 font-bebas text-2xl">{member.status}</p>
                    </div>
                  ) : (
                    <p className="text-lg text-gray-400">Empty Slot</p>
                  )}
                  {member?.status === 'pending' && index !== 0 ? (
                    <button
                      onClick={() => handleCancelInvite(index)}
                      className="ml-4 bg-red-500 text-white font-bebas text-2xl px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      Cancel Invite
                    </button>
                  ) : member?.status === 'confirmed' && index !== 0 && currentUser.uid === teamCaptainId ? (
                    <button
                      onClick={() => handleRemoveMember(index)}
                      className="ml-4 bg-red-500 text-white font-bebas text-2xl px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      Remove
                    </button>
                  ) : !member && index !== 0 ? (
                    <button
                      onClick={() => handleInvite(index)}
                      className="ml-4 bg-blue-500 text-white font-bebas text-2xl px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
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
            <div className="flex justify-end mt-8">
              <button
                onClick={handleLeaveTeam}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Leave Team
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmInvite}
        title="Invite Player"
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleGenerateLink={handleGenerateLink}
        shareableLink={shareableLink}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default LineupUI;
