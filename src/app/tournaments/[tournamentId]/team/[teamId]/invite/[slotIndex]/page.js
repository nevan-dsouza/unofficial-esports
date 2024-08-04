'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebaseConfig';

export default function InvitePage({ params }) {
  const { tournamentId, teamId, slotIndex } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if the user is already in a team
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          if (userData.teamId) {
            setError("You're already in a team.");
            setLoading(false);
            return;
          }

          // Add user to the team
          const teamRef = doc(db, 'tournaments', tournamentId, 'registrations', teamId);
          const teamDoc = await getDoc(teamRef);
          
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            const updatedLineup = [...teamData.lineup];
            updatedLineup[slotIndex] = {
              userId: user.uid,
              username: userData.username,
              status: 'confirmed',
              rank: userData.rank || '',
              numericRank: userData.numericRank || '',
              rankProof: userData.rankProof || '',
              servers: userData.servers || [],
            };

            await updateDoc(teamRef, { lineup: updatedLineup });

            // Update user's team information
            await updateDoc(doc(db, 'users', user.uid), { teamId: teamId });

            // Add tournament to user's MyTournaments
            const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
            const tournamentData = tournamentDoc.data();
            await setDoc(doc(db, 'users', user.uid, 'MyTournaments', tournamentId), {
              tournamentId: tournamentId,
              teamId: teamId,
              name: tournamentData.name || 'Unknown Tournament',
              date: tournamentData.date || new Date(),
            });

            router.push(`/tournaments/${tournamentId}/team/${teamId}`);
          } else {
            setError("Team not found.");
          }
        } catch (error) {
          console.error("Error processing invite:", error);
          setError("An error occurred while processing your invite.");
        }
      } else {
        // User is not signed in, redirect to sign in page
        router.push(`/signin?redirect=/tournaments/${tournamentId}/team/${teamId}/invite/${slotIndex}`);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, tournamentId, teamId, slotIndex]);

  if (loading) return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>;
  
  if (error) return <div className="flex justify-center items-center h-screen">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
    </div>
  </div>;

  return null;
}