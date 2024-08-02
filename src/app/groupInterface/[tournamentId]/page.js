'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from '../../lib/firebaseConfig';
import { doc, collection, addDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function Test1() {
    const [stacks, setStacks] = useState(Array(16).fill().map(() => []));
    const [playerNames, setPlayerNames] = useState('');
    const [playerRanks, setPlayerRanks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [serverPreference1, setServerPreference1] = useState('');
    const [serverPreference2, setServerPreference2] = useState('');
    const [registrations, setRegistrations] = useState([]);
    
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
            setRegistrations(registrationsData);
            formTeams(registrationsData);
        });
    
        return () => unsubscribe();
    }, [tournamentId]);

    useEffect(() => {
        fetchGroups();
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

    async function fetchGroups() {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const groupingRef = collection(tournamentRef, 'grouping');
        const snapshot = await getDocs(groupingRef);
        const groups = snapshot.docs.map(doc => doc.data());
        setStacks(groups.map(g => g.players || []));
    }

    function getAverageRank(stack) {
        if (stack.length === 0) return 0;
        const sum = stack.reduce((acc, player) => acc + player.numericRank, 0);
        return sum / stack.length;
    }

    function findBestStack(players, currentStacks) {
        let bestStack = -1;
        let smallestDifference = Infinity;
        const playerAvgRank = getAverageRank(players);
        const playerServers = players.flatMap(p => p.servers);
    
        for (let i = 0; i < currentStacks.length; i++) {
            if (currentStacks[i].length + players.length <= 5) {
                const stackAvgRank = getAverageRank(currentStacks[i]);
                const stackServers = currentStacks[i].flatMap(p => p.servers);
                
                const rankDifference = Math.abs(stackAvgRank - playerAvgRank);
                const pingScore = calculatePingScore(playerServers, stackServers);
                
                // Weighted difference (ping is twice as important as rank)
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
    
        const players = names.map((name, index) => ({
            id: `${name}-${Date.now()}`,
            name,
            rank: ranks[index],
            numericRank: rankToNumber[ranks[index]] || 0,
            servers: [serverPreference1, serverPreference2]
        }));
    
        // Check if this team size is allowed before adding to the database
        const bestStack = findBestStack(players, stacks);
        if (bestStack === -1) {
            setErrorMessage(`Teams of ${players.length} are not allowed at this time.`);
            return;
        }
    
        try {
            const tournamentRef = doc(db, 'tournaments', tournamentId);
            const registrationsRef = collection(tournamentRef, 'registrations');
            await addDoc(registrationsRef, {
                players,
                timestamp: new Date()
            });
    
            setPlayerNames('');
            setPlayerRanks('');
            setServerPreference1('');
            setServerPreference2('');
            setErrorMessage('');
        } catch (error) {
            console.error("Error adding registration: ", error);
            setErrorMessage('Failed to register. Please try again.');
        }
    }

    async function formTeams(registrations) {
        let newStacks = Array(16).fill().map(() => []);
        
        registrations.sort((a, b) => b.players.length - a.players.length);
    
        for (let registration of registrations) {
            const bestStack = findBestStack(registration.players, newStacks);
            if (bestStack === -1) {
                continue; // Skip this registration if it can't be placed
            }
            
            if (newStacks[bestStack].length + registration.players.length > 5) {
                const nextBestStack = findBestStack(registration.players.slice(0, 5 - newStacks[bestStack].length), newStacks);
                if (nextBestStack === -1) {
                    continue; // Skip if we can't place the remaining players
                }
                newStacks[bestStack] = [...newStacks[bestStack], ...registration.players.slice(0, 5 - newStacks[bestStack].length)];
                newStacks[nextBestStack] = [...newStacks[nextBestStack], ...registration.players.slice(5 - newStacks[bestStack].length)];
            } else {
                newStacks[bestStack] = [...newStacks[bestStack], ...registration.players];
            }
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
        
        // Check if the destination stack would exceed 5 players
        if (newStacks[destStack].length >= 5) {
            setErrorMessage("Cannot move player. Destination stack is full.");
            return;
        }

        const [reorderedItem] = newStacks[sourceStack].splice(result.source.index, 1);
        newStacks[destStack].splice(result.destination.index, 0, reorderedItem);

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
            const q = query(registrationsRef, where("players", "array-contains", playerToRemove));
            const querySnapshot = await getDocs(q);
    
            querySnapshot.forEach(async (doc) => {
                const registration = doc.data();
                const updatedPlayers = registration.players.filter(p => p.id !== playerToRemove.id);
    
                if (updatedPlayers.length === 0) {
                    // If no players left in this registration, delete the document
                    await deleteDoc(doc.ref);
                } else {
                    // Otherwise, update the document with the remaining players
                    await updateDoc(doc.ref, { players: updatedPlayers });
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
                if (stacks[i].length > 0) {
                    const teamAverage = getAverageRank(stacks[i]);
                    await addDoc(teamsCollectionRef, {
                        teamName: `Team ${i + 1}`,
                        teamNumber: i + 1,
                        teamAverage: teamAverage,
                        players: stacks[i].map(player => ({
                            name: player.name,
                            rank: player.rank
                        }))
                    });
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
                                    {stack.map((player, playerIndex) => (
                                        <Draggable key={player.id} draggableId={player.id} index={playerIndex}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="mb-1 p-2 bg-gray-100 rounded flex justify-between items-center"
                                                >
                                                    <div className="text-black">
                                                        <div>{player.name} ({player.rank})</div>
                                                        <div className="text-xs text-gray-600">
                                                            Servers: {player.servers.join(', ')}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            Ping Score: {calculatePingScore(player.servers, stack.flatMap(p => p.servers))}
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
                                            <p className="font-bold">Avg Rank: {getAverageRank(stack).toFixed(2)}</p>
                                            <p className="font-bold">
                                                Avg Ping Score: {
                                                    (stack.reduce((sum, player) => 
                                                        sum + calculatePingScore(player.servers, stack.flatMap(p => p.servers)), 0) / stack.length
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
                                {registration.players.length > 1 ? `Team ${index + 1}` : 'individual Player'}
                            </h3>
                            {registration.players.map((player, playerIndex) => (
                                <div key={playerIndex} className="mb-2">
                                    <div>{player.name} ({player.rank})</div>
                                    <div className="text-xs text-gray-600">
                                        Servers: {player.servers.join(', ')}
                                    </div>
                                </div>
                            ))}
                            <div className="text-sm text-gray-600 mt-2">
                                Registered: {new Date(registration.timestamp.seconds * 1000).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );}