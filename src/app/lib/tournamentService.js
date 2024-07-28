import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const getTournamentById = async (tournamentId) => {
  try {
    const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
    if (tournamentDoc.exists()) {
      return tournamentDoc.data();
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
};

export const registerTeam = async (userId, username, tournamentId) => {
  try {
    // Add team registration to the tournament
    const registrationsRef = collection(db, 'tournaments', tournamentId, 'registrations');
    const registrationData = {
      teamCaptainId: userId,
      teamCaptainUsername: username,
      lineup: [
        {
          userId: userId,
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

    // Update user's myTournaments
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      myTournaments: arrayUnion(tournamentId),
    });

    return registrationId;
  } catch (error) {
    console.error('Error registering team:', error);
    throw error;
  }
};

export const getMyTournaments = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().myTournaments || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user tournaments:', error);
    throw error;
  }
};

export const getTeamById = async (tournamentId, teamId) => {
  try {
    const teamDoc = await getDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
    if (teamDoc.exists()) {
      return teamDoc.data();
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};
