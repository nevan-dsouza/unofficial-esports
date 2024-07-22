// src/lib/tournamentService.js
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const getTournamentById = async (id) => {
  try {
    const docRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
};
