'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebaseConfig';
import { doc, collection, getDocs, setDoc, query, orderBy } from 'firebase/firestore';

export default function BracketManagement() {
    const params = useParams();
    const tournamentId = params.tournamentId;
    const [teams, setTeams] = useState([]);
    const [bracket, setBracket] = useState([]);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const teamsCollectionRef = collection(tournamentRef, 'teams');
        const q = query(teamsCollectionRef, orderBy('teamAverage', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedTeams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeams(fetchedTeams);
        await fetchOrGenerateBracket(fetchedTeams);
    };

    const fetchOrGenerateBracket = async (teams) => {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const bracketCollectionRef = collection(tournamentRef, 'bracket');
        const bracketSnapshot = await getDocs(bracketCollectionRef);

        if (bracketSnapshot.empty) {
            const newBracket = generateInitialBracket(teams);
            await saveBracketToDatabase(newBracket);
            setBracket(newBracket);
        } else {
            const fetchedBracket = bracketSnapshot.docs.map(doc => doc.data());
            fetchedBracket.sort((a, b) => a.round - b.round);
            setBracket(fetchedBracket);
        }
    };

    const generateInitialBracket = (teams) => {
        const rounds = Math.ceil(Math.log2(teams.length));
        let bracket = [];

        for (let i = 0; i < rounds; i++) {
            let round = [];
            const matchesInRound = Math.pow(2, rounds - i - 1);
            for (let j = 0; j < matchesInRound; j++) {
                if (i === 0) {
                    const team1Index = j;
                    const team2Index = teams.length - 1 - j;
                    round.push({
                        matchId: `${i}-${j}`,
                        team1: team1Index < teams.length ? teams[team1Index] : null,
                        team2: team2Index >= 0 && team2Index < teams.length ? teams[team2Index] : null,
                        score1: 0,
                        score2: 0,
                        winner: null
                    });
                } else {
                    round.push({ matchId: `${i}-${j}`, team1: null, team2: null, score1: 0, score2: 0, winner: null });
                }
            }
            bracket.push({ round: i, matches: round });
        }

        return bracket;
    };

    const saveBracketToDatabase = async (bracket) => {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const bracketCollectionRef = collection(tournamentRef, 'bracket');
        
        for (const round of bracket) {
            await setDoc(doc(bracketCollectionRef, `round-${round.round}`), round);
        }
    };

    const updateMatch = (roundIndex, matchIndex, score1, score2) => {
        const updatedBracket = [...bracket];
        updatedBracket[roundIndex].matches[matchIndex].score1 = parseInt(score1);
        updatedBracket[roundIndex].matches[matchIndex].score2 = parseInt(score2);
        setBracket(updatedBracket);
    };

    const saveMatch = async (roundIndex, matchIndex) => {
        const match = bracket[roundIndex].matches[matchIndex];
        const winner = match.score1 > match.score2 ? match.team1 :
                       match.score2 > match.score1 ? match.team2 : null;

        const updatedBracket = [...bracket];
        updatedBracket[roundIndex].matches[matchIndex].winner = winner;

        if (winner && roundIndex < bracket.length - 1) {
            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
            const isFirstTeamInNextMatch = matchIndex % 2 === 0;

            if (isFirstTeamInNextMatch) {
                updatedBracket[roundIndex + 1].matches[nextRoundMatchIndex].team1 = winner;
            } else {
                updatedBracket[roundIndex + 1].matches[nextRoundMatchIndex].team2 = winner;
            }
        }

        setBracket(updatedBracket);
        await saveBracketToDatabase(updatedBracket);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Bracket Management</h1>
            {bracket.map((round, roundIndex) => (
                <div key={roundIndex} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-2">Round {roundIndex + 1}</h2>
                    {round.matches.map((match, matchIndex) => (
                        <div key={match.matchId} className="border p-4 mb-4 rounded">
                            <p>{match.team1 ? match.team1.teamName : 'TBD'} vs {match.team2 ? match.team2.teamName : 'TBD'}</p>
                            <input 
                                type="number" 
                                value={match.score1} 
                                onChange={(e) => updateMatch(roundIndex, matchIndex, e.target.value, match.score2)}
                                className="w-16 p-1 border rounded mr-2 text-black"
                            />
                            <input 
                                type="number" 
                                value={match.score2} 
                                onChange={(e) => updateMatch(roundIndex, matchIndex, match.score1, e.target.value)}
                                className="w-16 p-1 border rounded mr-2 text-black"
                            />
                            <button 
                                onClick={() => saveMatch(roundIndex, matchIndex)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                            {match.winner && <p className="mt-2">Winner: {match.winner.teamName}</p>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}