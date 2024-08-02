'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../../lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import LineupUI from '../../../../components/LineupUI/LineupUI';

const TeamPage = () => {
  const { tournamentId, teamId } = useParams();
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      const teamDoc = await getDoc(doc(db, 'tournaments', tournamentId, 'registrations', teamId));
      if (teamDoc.exists()) {
        setTeamData(teamDoc.data());
      } else {
        console.error('Team data not found');
      }
    };

    fetchTeamData();
  }, [tournamentId, teamId]);

  if (!teamData) return <div>Loading...</div>;

  return <LineupUI tournamentId={tournamentId} teamId={teamId} />;
};

export default TeamPage;
