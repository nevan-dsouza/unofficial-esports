'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from '../../lib/firebaseConfig';
import { doc, collection, addDoc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function Test1() {
    const [stacks, setStacks] = useState([]);
    const [playerNames, setPlayerNames] = useState('');
    const [playerRanks, setPlayerRanks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [serverPreference1, setServerPreference1] = useState('');
    const [serverPreference2, setServerPreference2] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [numberOfTeams, setNumberOfTeams] = useState(0);
    const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(3); // New state for max players per team
    
    const params = useParams();
    const tournamentId = params.tournamentId;

    const rankToNumber = {
        'Iron': 5, 'Bronze': 10, 'Silver': 15, 'Gold': 20, 'Platinum': 25,
        'Diamond': 30, 'Ascendant': 35, 'Immortal': 40, 'Radiant': 45
    };
    
    useEffect(() => {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const registrationsRef = collection(tournamentRef, 'registrations');
    
        const unsubscribe = onSnapshot(registrationsRef, (snapshot) => {
            const registrationsData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            console.log('Registrations data:', registrationsData); // Add this line
            setRegistrations(registrationsData);
            formTeams(registrationsData);
        });
    
        return () => unsubscribe();
    }, [tournamentId, numberOfTeams, maxPlayersPerTeam]);

    useEffect(() => {
        fetchTournamentDetails();
    }, [tournamentId]);

    const serverOptions = [
        "US West (Oregon)",
        "US West (N. California)",
        "US East (N. Virginia)",
        "US Central (Texas)",
        "US Central (Illinois)",
        "US Central (Georgia)"
    ];

    function calculatePingScore(playerServers, stackServers) {
        const commonServers = playerServers.filter(server => stackServers.includes(server));
        return commonServers.length * 5; // 10 points for each common server
    }

    const fetchTournamentDetails = async () => {
        try {
          const tournamentRef = doc(db, 'tournaments', tournamentId);
          const tournamentSnap = await getDoc(tournamentRef);
          
          if (tournamentSnap.exists()) {
            const tournamentData = tournamentSnap.data();
            const numTeams = parseInt(tournamentData.numberOfTeams);
            const maxPlayers = parseInt(tournamentData.maxPlayersPerTeam);
            console.log("Tournament data:", tournamentData);
            console.log("Number of teams:", numTeams);
            console.log("Max players per team:", maxPlayers);
            setNumberOfTeams(numTeams);
            setMaxPlayersPerTeam(maxPlayers);
            setStacks(Array(numTeams).fill().map(() => []));
            
            fetchGroups();
          } else {
            console.log("No such tournament! ID:", tournamentId);
          }
        } catch (error) {
          console.error("Error fetching tournament details:", error);
        }
    };

    async function fetchGroups() {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const groupingRef = collection(tournamentRef, 'grouping');
        const snapshot = await getDocs(groupingRef);
        const groups = snapshot.docs.map(doc => doc.data());
        setStacks(groups.map(g => g.players || []));
    }

    function getAverageRank(players) {
        const validPlayers = players.filter(player => player !== null && player.numericRank !== undefined);
        if (validPlayers.length === 0) return 0;
    
        const sum = validPlayers.reduce((acc, player) => {
            const rank = rankToNumber[player.rank] || player.numericRank;
            return acc + (typeof rank === 'number' ? rank : 0);
        }, 0);
    
        return sum / validPlayers.length;
    }

    function findBestStack(players, currentStacks) {
        let bestStack = -1;
        let smallestDifference = Infinity;
        const playerAvgRank = getAverageRank(players);
        const playerServers = players.flatMap(p => p.servers);
    
        for (let i = 0; i < currentStacks.length; i++) {
            const validPlayers = currentStacks[i].filter(p => p !== null);
            if (validPlayers.length + players.length <= maxPlayersPerTeam) {
                const stackAvgRank = getAverageRank(validPlayers);
                const stackServers = validPlayers.flatMap(p => p.servers);
                
                const rankDifference = Math.abs(stackAvgRank - playerAvgRank);
                const pingScore = calculatePingScore(playerServers, stackServers);
                
                const weightedDifference = (rankDifference * 1) + (20 - pingScore) * 2;
    
                if (weightedDifference < smallestDifference) {
                    smallestDifference = weightedDifference;
                    bestStack = i;
                }
            }
        }
    
        return bestStack;
    }

    
    async function handleSubmit(e) {
        e.preventDefault();
        const names = playerNames.split(',').map(name => name.trim());
        const ranks = playerRanks.split(',').map(rank => rank.trim());
        
        if (names.length !== ranks.length || !serverPreference1 || !serverPreference2) {
            setErrorMessage('Number of names and ranks must match, and both server preferences must be selected!');
            return;
        }
    
        if (serverPreference1 === serverPreference2) {
            setErrorMessage('Please select two different server preferences.');
            return;
        }
    
        if (names.length > maxPlayersPerTeam) {
            setErrorMessage(`Maximum ${maxPlayersPerTeam} players allowed per team.`);
            return;
        }
    
        const lineup = names.map((name, index) => ({
            id: `${name}-${Date.now()}-${index}`, // Ensure each player has a unique id
            username: name,
            rank: ranks[index],
            numericRank: (rankToNumber[ranks[index]] || 0).toString(),
            rankProof: "Not Required - added by admin",
            servers: [serverPreference1, serverPreference2],
            status: "added by admin",
        }));
    
        // Pad the lineup array with null values to match the desired structure
        while (lineup.length < 5) {
            lineup.push(null);
        }
        
        const validPlayers = lineup.filter(p => p !== null);
        const bestStack = findBestStack(validPlayers, stacks);
        if (bestStack === -1) {
            setErrorMessage(`Teams of ${validPlayers.length} are not allowed at this time.`);
            return;
        }

    
        try {
            const tournamentRef = doc(db, 'tournaments', tournamentId);
            const registrationsRef = collection(tournamentRef, 'registrations');
            
            // Ensure teamCaptainId and teamCaptainUsername are set
            const teamCaptain = lineup[0];
            if (!teamCaptain) {
                throw new Error("No team captain found in lineup");
            }
    
            await addDoc(registrationsRef, {
                lineup,
                teamCaptainId: teamCaptain.id,
                teamCaptainUsername: teamCaptain.username,
                timestamp: new Date()
            });
    
            setPlayerNames('');
            setPlayerRanks('');
            setServerPreference1('');
            setServerPreference2('');
            setErrorMessage('');
            console.log("Registration submitted successfully");
        } catch (error) {
            console.error("Error adding registration: ", error);
            setErrorMessage('Failed to register. Please try again.');
        }
    }

    async function formTeams(registrations) {
        if (numberOfTeams === 0) {
            console.log("Number of teams is 0, skipping team formation");
            return;
        }
        
        let newStacks = Array(numberOfTeams).fill().map(() => []);
        
        // Sort registrations by team size (largest to smallest)
        registrations.sort((a, b) => (b.lineup.filter(p => p !== null).length - a.lineup.filter(p => p !== null).length));
    
        for (let registration of registrations) {
            const players = registration.lineup.filter(p => p !== null);
    
            const bestStack = findBestStack(players, newStacks);
            if (bestStack === -1) {
                continue; // Skip this registration if it can't be placed
            }
            
            newStacks[bestStack] = [...newStacks[bestStack], ...players];
        }
    
        setStacks(newStacks);
        await updateGrouping(newStacks);
    }

    async function updateGrouping(newStacks) {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const groupingRef = collection(tournamentRef, 'grouping');

        for (let i = 0; i < newStacks.length; i++) {
            await setDoc(doc(groupingRef, `stack${i+1}`), {
                stackName: `Stack ${i+1}`,
                players: newStacks[i]
            });
        }
    }

    const onDragEnd = async (result) => {
        if (!result.destination) return;
    
        const sourceStack = parseInt(result.source.droppableId);
        const destStack = parseInt(result.destination.droppableId);
    
        const newStacks = [...stacks];
        
        const validPlayersInDestStack = newStacks[destStack].filter(p => p !== null);
        if (validPlayersInDestStack.length >= maxPlayersPerTeam) {
            setErrorMessage(`Cannot move player. Destination stack is full (max ${maxPlayersPerTeam} players).`);
            return;
        }
    
        const [reorderedItem] = newStacks[sourceStack].splice(result.source.index, 1);
        newStacks[destStack].splice(result.destination.index, 0, reorderedItem);
    
        // Remove any null values from the stacks
        newStacks.forEach((stack, index) => {
            newStacks[index] = stack.filter(player => player !== null);
        });
    
        setStacks(newStacks);
        await updateGrouping(newStacks);
    };

    const removePlayer = async (stackIndex, playerIndex) => {
        try {
            const playerToRemove = stacks[stackIndex][playerIndex];
    
            // Remove from stacks (UI)
            const newStacks = [...stacks];
            newStacks[stackIndex].splice(playerIndex, 1);
            setStacks(newStacks);
    
            // Remove from grouping collection
            await updateGrouping(newStacks);
    
            // Remove from registrations collection
            const tournamentRef = doc(db, 'tournaments', tournamentId);
            const registrationsRef = collection(tournamentRef, 'registrations');
            
            // Query all registrations (we'll filter in JavaScript)
            const querySnapshot = await getDocs(registrationsRef);
    
            querySnapshot.forEach(async (doc) => {
                const registration = doc.data();
                
                // Check if the player is in this registration's lineup
                const playerIndex = registration.lineup.findIndex(p => p && p.id === playerToRemove.id);
                
                if (playerIndex !== -1) {
                    const updatedLineup = [...registration.lineup];
                    updatedLineup[playerIndex] = null; // Set to null instead of removing
    
                    // If all players in lineup are null, delete the document
                    if (updatedLineup.every(p => p === null)) {
                        await deleteDoc(doc.ref);
                    } else {
                        // Otherwise, update the document with the updated lineup
                        await updateDoc(doc.ref, { lineup: updatedLineup });
                    }
                }
            });
    
            console.log('Player removed successfully');
        } catch (error) {
            console.error("Error removing player: ", error);
            setErrorMessage('Failed to remove player. Please try again.');
        }
    };

    const handleFinalSubmit = async () => {
        try {
            const tournamentRef = doc(db, 'tournaments', tournamentId);
            const teamsCollectionRef = collection(tournamentRef, 'teams');
    
            for (let i = 0; i < stacks.length; i++) {
                const validPlayers = stacks[i].filter(player => player !== null);
                if (validPlayers.length > 0) {
                    const teamName = `Team ${i + 1}`;
                    const teamAverage = getAverageRank(validPlayers);
                    const teamDocRef = doc(teamsCollectionRef, teamName);
                    
                    const teamData = {
                        teamName: teamName,
                        teamNumber: i + 1,
                        teamAverage: teamAverage,
                        players: validPlayers.map(player => ({
                            id: player.id,
                            username: player.username,
                            rank: player.rank,
                            numericRank: player.numericRank,
                            servers: player.servers
                        }))
                    };
    
                    // Remove any undefined values
                    Object.keys(teamData).forEach(key => 
                        teamData[key] === undefined && delete teamData[key]
                    );
    
                    await setDoc(teamDocRef, teamData);
                }
            }
    
            alert('Teams have been successfully saved to the database!');
        } catch (error) {
            console.error("Error saving teams: ", error);
            alert('An error occurred while saving the teams. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Team Formation</h1>
            <p className="text-xl mb-4">Number of Teams: {numberOfTeams}</p>
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label htmlFor="playerNames" className="block mb-2">Player Names (comma-separated):</label>
                    <input 
                        type="text" 
                        id="playerNames" 
                        value={playerNames} 
                        onChange={(e) => setPlayerNames(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="playerRanks" className="block mb-2">Player Ranks (comma-separated):</label>
                    <input 
                        type="text" 
                        id="playerRanks" 
                        value={playerRanks} 
                        onChange={(e) => setPlayerRanks(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="serverPreference1" className="block mb-2">First Server Preference:</label>
                    <select 
                        id="serverPreference1" 
                        value={serverPreference1} 
                        onChange={(e) => setServerPreference1(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                    >
                        <option value="">Select a server</option>
                        {serverOptions.map((server, index) => (
                            <option key={index} value={server}>{server}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="serverPreference2" className="block mb-2">Second Server Preference:</label>
                    <select 
                        id="serverPreference2" 
                        value={serverPreference2} 
                        onChange={(e) => setServerPreference2(e.target.value)}
                        className="w-full p-2 border rounded text-black"
                    >
                        <option value="">Select a server</option>
                        {serverOptions.map((server, index) => (
                            <option key={index} value={server}>{server}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Register
                </button>
            </form>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stacks.map((stack, index) => (
                        <Droppable droppableId={index.toString()} key={index}>
                            {(provided) => (
                                <div 
                                    {...provided.droppableProps} 
                                    ref={provided.innerRef}
                                    className="border p-4 rounded shadow min-h-[100px]"
                                >
                                    <h3 className="text-xl font-semibold mb-2">Stack {index + 1}</h3>
                                    {stack.filter(player => player !== null).map((player, playerIndex) => (
                                        <Draggable key={player.id} draggableId={player.id} index={playerIndex}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="mb-1 p-2 bg-gray-100 rounded flex justify-between items-center"
                                                >
                                                    <div className="text-black">
                                                        <div>{player.username} ({player.rank})</div>
                                                        <div className="text-xs text-gray-600">
                                                            Servers: {player.servers.join(', ')}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Ping Score: {calculatePingScore(player.servers, stack.flatMap(p => p?.servers || []))}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removePlayer(index, playerIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {stack.length > 0 && (
                                        <div className="mt-2 text-sm">
                                            <p className="font-bold">Avg Rank: {getAverageRank(stack.filter(p => p !== null)).toFixed(2)}</p>
                                            <p className="font-bold">
                                                Avg Ping Score: {
                                                    (stack.filter(p => p !== null).reduce((sum, player) => 
                                                        sum + calculatePingScore(player.servers, stack.flatMap(p => p?.servers || [])), 0) / stack.filter(p => p !== null).length
                                                    ).toFixed(2)
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            <button 
                onClick={handleFinalSubmit}
                className="mt-8 bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 w-full"
            >
                Submit Teams to Database
            </button>
            <h2 className="text-2xl font-bold mb-4">Registered Teams and Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {registrations.map((registration, index) => (
                    <div key={registration.id} className="border p-4 rounded shadow">
                        <h3 className="text-xl font-semibold mb-2">
                            {registration.lineup && registration.lineup.filter(p => p !== null).length > 1 ? `Team ${index + 1}` : 'Solo Player'}
                        </h3>
                        {/* Accessing players from the lineup array */}
                        {registration.lineup && registration.lineup.map((player, playerIndex) => {
                            // Skip rendering null entries in the lineup
                            if (player === null) return null; 
                            return (
                                <div key={playerIndex} className="mb-2">
                                    <p>Username: {player.username}</p>
                                    <p>Status: {player.status}</p>
                                    {/* Add more player details as needed */}
                                </div>
                            );
                        })} {/* <-- Closing bracket added here */}
                    </div>
                ))}
            </div>
            </div>
        );}