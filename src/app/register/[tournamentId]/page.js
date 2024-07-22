'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LineupUI from '../../components/LineupUI/LineupUI';
import { db } from '../../lib/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

const RegisterPage = () => {
  const router = useRouter();
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
        if (tournamentDoc.exists()) {
          setTournament(tournamentDoc.data());
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        router.push('/404');
      }
    };

    fetchTournament();
  }, [tournamentId, router]);

  useEffect(() => {
    if (tournament) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(tournament.date.seconds * 1000).getTime();
        const distance = deadline - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });

        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft({});
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tournament]);

  if (!tournament) return <div>Loading...</div>;

  return (
    <div className="container mx-auto my-8 p-8 bg-white rounded-lg shadow-lg text-black">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-center font-bebas mb-4">{tournament.name}</h1>
        <p className="text-lg text-center">{tournament.description}</p>
        <p className="text-3xl text-center font-bold font-bebas">
          <span className="text-black">Registration Deadline: </span>
          {timeLeft.days >= 0 ? (
            <span className="text-red-600">
              {`${timeLeft.days} Days, ${timeLeft.hours} Hours, ${timeLeft.minutes} Minutes, ${timeLeft.seconds} Seconds left`}
            </span>
          ) : (
            <span className="text-red-600">Registration deadline has passed</span>
          )}
        </p>
      </div>
      <LineupUI tournamentId={tournamentId} />
    </div>
  );
};

export default RegisterPage;
