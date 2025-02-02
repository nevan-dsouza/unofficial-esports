'use client';

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/authContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, collection, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { getAuth } from 'firebase/auth';
import MyAwards from '../components/MyAwards/MyAwards'; 

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarURL, setAvatarURL] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [invites, setInvites] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [tournamentData, setTournamentData] = useState({});
  const [teamData, setTeamData] = useState({});
  const [playerCard, setPlayerCard] = useState(null);
  const [awards, setAwards] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchDefaultImages = async () => {
      const storage = getStorage();
      const defaultPlayerCardRef = ref(storage, 'default/default-player-card.png');
      const defaultAvatarRef = ref(storage, 'default/default-avatar.png');

      const defaultPlayerCardURL = await getDownloadURL(defaultPlayerCardRef);
      const defaultAvatarURL = await getDownloadURL(defaultAvatarRef);

      setPlayerCard(defaultPlayerCardURL);
      setAvatarURL(defaultAvatarURL);
    };

    fetchDefaultImages();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            username: userData.username,
            email: user.email,
          });
          if (userData.photoURL) {
            setAvatarURL(userData.photoURL);
          }
          if (userData.playerCardURL) {
            setPlayerCard(userData.playerCardURL);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchInvites = async () => {
      if (user) {
        const invitesRef = collection(db, 'users', user.uid, 'invites');
        const invitesSnapshot = await getDocs(invitesRef);
        const invitesData = invitesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const updatedInvites = await Promise.all(invitesData.map(async (invite) => {
          const tournamentDoc = await getDoc(doc(db, 'tournaments', invite.tournamentId));
          if (tournamentDoc.exists()) {
            const tournamentData = tournamentDoc.data();
            const registrationDeadline = tournamentData.registrationDeadline ? new Date(tournamentData.registrationDeadline.seconds * 1000) : null;
            if (registrationDeadline && new Date() > registrationDeadline && invite.status === 'waiting') {
              await updateDoc(doc(db, 'users', user.uid, 'invites', invite.id), {
                status: 'closed',
              });
              return { ...invite, status: 'closed' };
            }
          }
          return invite;
        }));

        setInvites(updatedInvites);
      }
    };
    fetchInvites();
  }, [user]);

  useEffect(() => {
    const fetchMyTournaments = async () => {
      if (user) {
        const myTournamentsRef = collection(db, 'users', user.uid, 'MyTournaments');
        const myTournamentsSnapshot = await getDocs(myTournamentsRef);
        const myTournamentsData = myTournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyTournaments(myTournamentsData);
      }
    };
    fetchMyTournaments();
  }, [user]);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const tournaments = await Promise.all(
          myTournaments.map(async (tournament) => {
            const tournamentDoc = await getDoc(doc(db, 'tournaments', tournament.tournamentId));
            if (tournamentDoc.exists()) {
              return { id: tournament.tournamentId, ...tournamentDoc.data() };
            }
            return null;
          })
        );

        const tournamentDataMap = tournaments.reduce((acc, tournament) => {
          if (tournament) {
            acc[tournament.id] = tournament;
          }
          return acc;
        }, {});

        setTournamentData(tournamentDataMap);
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      }
    };

    if (myTournaments.length > 0) {
      fetchTournamentData();
    }
  }, [myTournaments]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teams = await Promise.all(
          myTournaments.map(async (tournament) => {
            const teamRef = doc(db, 'tournaments', tournament.tournamentId, 'registrations', tournament.teamId);
            const teamDoc = await getDoc(teamRef);
            if (teamDoc.exists()) {
              return { id: tournament.teamId, ...teamDoc.data() };
            }
            return null;
          })
        );

        const teamDataMap = teams.reduce((acc, team) => {
          if (team) {
            acc[team.id] = team;
          }
          return acc;
        }, {});

        setTeamData(teamDataMap);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    if (myTournaments.length > 0) {
      fetchTeamData();
    }
  }, [myTournaments]);

  useEffect(() => {
    const fetchUserAwards = async () => {
      if (user) {
        const userAwardsRef = collection(db, 'users', user.uid, 'awards');
        const userAwardsSnapshot = await getDocs(userAwardsRef);
        const awardsData = userAwardsSnapshot.docs.map(awardDoc => ({ id: awardDoc.id, ...awardDoc.data() }));

        const awardsWithDetails = await Promise.all(
          awardsData.map(async (award) => {
            const awardDocRef = doc(db, 'awards', award.awardId);
            const awardDoc = await getDoc(awardDocRef);
            if (awardDoc.exists()) {
              return { id: award.awardId, ...awardDoc.data(), earnedDate: award.earnedDate.toDate(), favorite: award.favorite };
            }
            return null;
          })
        );

        console.log('Awards fetched:', awardsWithDetails);
        setAwards(awardsWithDetails.filter(award => award));
      }
    };

    fetchUserAwards();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: formData.username,
      });
  
      if (avatar) {
        const storage = getStorage();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, avatar);
        const photoURL = await getDownloadURL(avatarRef);
        await updateDoc(userRef, { photoURL });
        setAvatarURL(photoURL);
      }
  
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };  

  const handleAvatarChange = (e) => {
    if (e.target.files[0]) {
      setAvatar(e.target.files[0]);
      // Create a preview of the new avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarURL(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/signin');
  };

  const handleAcceptInvite = async (inviteId, tournamentId, teamId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const inviteRef = doc(db, 'users', currentUser.uid, 'invites', inviteId);
  
      await updateDoc(inviteRef, {
        status: 'confirmed',
      });
  
      const teamRef = doc(db, 'tournaments', tournamentId, 'registrations', teamId);
      const teamDoc = await getDoc(teamRef);
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const memberIndex = teamData.lineup.findIndex(member => member?.userId === currentUser.uid);
        if (memberIndex !== -1) {
          teamData.lineup[memberIndex].status = 'confirmed';
          await updateDoc(teamRef, {
            lineup: teamData.lineup,
          });
        }
      }
  
      const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (!tournamentDoc.exists()) {
        throw new Error('Tournament data not found');
      }
      const tournamentData = tournamentDoc.data();
  
      const myTournamentsRef = collection(db, 'users', currentUser.uid, 'MyTournaments');
      await setDoc(doc(myTournamentsRef, tournamentId), {
        tournamentId: tournamentId,
        teamId: teamId,
        name: tournamentData.name || 'Unknown Tournament',
        date: tournamentData.date || new Date(),
      });
  
      await deleteDoc(inviteRef);
  
      const fetchInvites = async () => {
        const invitesRef = collection(db, 'users', currentUser.uid, 'invites');
        const invitesSnapshot = await getDocs(invitesRef);
        const invitesData = invitesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvites(invitesData);
      };
  
      fetchInvites();
      setMyTournaments(prevTournaments => {
        if (!prevTournaments.some(tournament => tournament.tournamentId === tournamentId)) {
          return [...prevTournaments, { tournamentId, teamId, name: tournamentData.name, date: tournamentData.date }];
        }
        return prevTournaments;
      });
  
      router.push(`/tournaments/${tournamentId}/team/${teamId}`);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };    

  const handleDeclineInvite = async (inviteId, tournamentId, teamId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const inviteRef = doc(db, 'users', currentUser.uid, 'invites', inviteId);

      const teamRef = doc(db, 'tournaments', tournamentId, 'registrations', teamId);
      const teamDoc = await getDoc(teamRef);
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const memberIndex = teamData.lineup.findIndex(member => member?.userId === currentUser.uid);
        if (memberIndex !== -1) {
          teamData.lineup[memberIndex] = null;
          await updateDoc(teamRef, {
            lineup: teamData.lineup,
          });
        }
      }

      await deleteDoc(inviteRef);

      const myTournamentsRef = collection(db, 'users', currentUser.uid, 'MyTournaments');
      const myTournamentDoc = doc(myTournamentsRef, teamId);
      await deleteDoc(myTournamentDoc);

      const fetchInvites = async () => {
        const invitesRef = collection(db, 'users', currentUser.uid, 'invites');
        const invitesSnapshot = await getDocs(invitesRef);
        const invitesData = invitesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvites(invitesData);
      };

      fetchInvites();
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  const toggleFavorite = async (awardId) => {
    const awardRef = doc(db, 'users', user.uid, 'awards', awardId);
    const awardDoc = await getDoc(awardRef);
    const isFavorite = awardDoc.data().favorite;

    await updateDoc(awardRef, { favorite: !isFavorite });
    const userAwardsRef = collection(db, 'users', user.uid, 'awards');
    const userAwardsSnapshot = await getDocs(userAwardsRef);
    const awardsData = userAwardsSnapshot.docs.map(awardDoc => ({ id: awardDoc.id, ...awardDoc.data() }));

    const awardsWithDetails = await Promise.all(
      awardsData.map(async (award) => {
        const awardDocRef = doc(db, 'awards', award.awardId);
        const awardDoc = await getDoc(awardDocRef);
        return { id: award.awardId, ...awardDoc.data(), earnedDate: award.earnedDate.toDate(), favorite: award.favorite };
      })
    );

    setAwards(awardsWithDetails.filter(award => award));
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-md shadow-lg">
      <div className="flex mb-8">
        <div className="flex flex-col items-center mr-8 transition duration-300">
          <div className="relative w-60 h-120 bg-black rounded-lg overflow-hidden shadow-lg transform transition-transform hover:-translate-y-2 shadow-gray-800 duration-300">
            <img src={playerCard} alt="Player Card" className="w-full h-full object-cover" />
            <div className="absolute bottom-20 w-full flex justify-center my-12">
              <div
                className="relative w-32 h-32"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
              >
                <img src={avatarURL} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white" />
                {hovering && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded-full">
                    <label className="cursor-pointer text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536M16 4h4v4M4 20h16v2H4a2 2 0 01-2-2V4a2 2 0 012-2h8l4 4H4v14z"
                        />
                      </svg>
                      <input type="file" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-10 w-full text-center text-white">
              <h1 className="text-2xl font-bold font-bebas m-12">@{formData.username}</h1>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 rounded-xl mb-2 h-150 text-black border-2 border-black transition duration-300 bg-gradient-to-br from-yellow-100 via-white to-yellow-300" style={{ height: '480px' }}>
          <MyAwards awards={awards} toggleFavorite={toggleFavorite} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-white">
        <div className="col-span-1 bg-black p-6 rounded-xl text-white">
          <h2 className="text-4xl font-semibold mb-4 font-bebas">User Details</h2>
          {isEditing ? (
            <div>
              <label className="block mb-2">
                Username
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-black"
                />
              </label>
              <label className="block mb-2">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-black"
                  readOnly
                />
              </label>
              <button onClick={handleSave} className="bg-white text-black px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-300 mt-4">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-300 mt-4 ml-4">
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg mb-2">Username: {formData.username}</p>
              <p className="text-lg mb-2">Email: {formData.email}</p>
              <button onClick={() => setIsEditing(true)} className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-all duration-300 mt-4">
                Edit Profile
              </button>
            </div>
          )}
        </div>
        <div className="col-span-1 bg-black p-6 rounded-xl text-white">
          <h2 className="text-4xl font-semibold mb-4 font-bebas">Statistics</h2>
          <p className="text-lg mb-2">Tournaments Played: {user?.tournamentsPlayed || 0}</p>
          <p className="text-lg mb-2">Tournaments Won: {user?.tournamentsWon || 0}</p>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl mb-8 text-black">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">My Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          {myTournaments.map((tournament) => {
            const tournamentDetails = tournamentData[tournament.tournamentId];
            if (tournamentDetails) {
              const team = teamData[tournament.teamId];
              return (
                <div key={`${tournament.tournamentId}-${tournament.teamId}`} className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="text-2xl font-semibold font-bebas">{tournamentDetails.name}</h3>
                  <p className="text-lg">{new Date(tournamentDetails.date.seconds * 1000).toLocaleDateString()}</p>
                  {team && (
                    <button
                      onClick={() => router.push(`/tournaments/${tournament.tournamentId}/team/${tournament.teamId}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 mt-2"
                    >
                      View Lineup
                    </button>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl mb-8 text-black">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Invites</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
        {invites.map((invite) => (
          <div key={invite.id} className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-2xl font-semibold font-bebas">{invite.tournamentId}</h3>
            <p className="text-lg">Invited by: {invite.inviterUsername}</p>
            <p className="text-lg">{invite.timestamp ? new Date(invite.timestamp.seconds * 1000).toLocaleDateString() : 'No Date'}</p>
            {invite.status === 'pending' && (
              <>
                <button
                  onClick={() => handleAcceptInvite(invite.id, invite.tournamentId, invite.teamId)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 mt-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineInvite(invite.id, invite.tournamentId, invite.teamId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 mt-2 ml-2"
                >
                  Decline
                </button>
              </>
            )}
            {invite.status !== 'pending' && (
              <p className="text-lg">Status: {invite.status}</p>
            )}
          </div>
        ))}

        </div>
      </div>
      
      <div className="bg-black p-6 rounded-md text-white">
        <h2 className="text-4xl font-semibold mb-4 font-bebas">Settings</h2>
        <button onClick={handleLogout} className="bg-white text-black font-bold px-6 py-2 rounded-md hover:bg-red-700 hover:text-white transition-all duration-300 mt-4">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;