'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../lib/firebaseConfig'; // Adjust this import path if needed
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addAward, assignAwardToUser } from '../lib/awardService';


const categories = [
  'Beginner Tournaments',
  'Intermediate Tournaments',
  'Expert Tournaments',
  'Region-Specific Tournaments',
  'individual/Duo/Team Tournaments',
  'Themed Tournaments',
  'Seasonal Tournaments',
  'Invitational Tournaments',
  'Charity Tournaments',
  'Sponsored Tournaments'
];

export default function AdminControlPage() {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    id: '',
    name: '',
    game: '',
    date: '',
    format: '',
    region: '',
    category: '',
    competitionStructure: '',
    eligibility: '',
    gameplayRules: '',
    generalRules: '',
    maxPlayersPerTeam: 0, // Number type
    numberOfTeams: 0,   // Number type
    officialRules: '',
    bannerImage: '' // Add banner image field
  });
  const [awards, setAwards] = useState([]);
  const [newAward, setNewAward] = useState({
    id: '',
    name: '',
    category: '',
    description: '',
    image: null
  });
  const [assignAwardData, setAssignAwardData] = useState({
    userId: '',
    awardId: ''
  });

  useEffect(() => {
    fetchTournaments();
    fetchAwards();
  }, []);

  const fetchTournaments = async () => {
    const tournamentsCollection = collection(db, 'tournaments');
    const tournamentSnapshot = await getDocs(tournamentsCollection);
    const tournamentList = tournamentSnapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.date instanceof Timestamp ? data.date.toDate().toLocaleDateString() : data.date;
      return {
        id: doc.id,
        ...data,
        date
      };
    });
    setTournaments(tournamentList);
  };


  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
  
    if (name === 'bannerImage') {
      setNewTournament(prev => ({ ...prev, [name]: files[0] }));
    } else if (name === 'numberOfTeams' || name === 'maxPlayersPerTeam') {
      setNewTournament(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setNewTournament(prev => ({ ...prev, [name]: value || 'None' }));
    }
  };

  const fetchAwards = async () => {
    const awardsCollection = collection(db, 'awards');
    const awardsSnapshot = await getDocs(awardsCollection);
    const awardsList = awardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAwards(awardsList);
  };

  const handleAwardInputChange = (e) => {
    const { name, value } = e.target;
    setNewAward(prev => ({ ...prev, [name]: value }));
  };

  const handleAwardImageChange = (e) => {
    if (e.target.files[0]) {
      setNewAward(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleAssignAwardInputChange = (e) => {
    const { name, value } = e.target;
    setAssignAwardData(prev => ({ ...prev, [name]: value }));
  };

  const addTournament = async (e) => {
    e.preventDefault();

    // Generate tournamentId based on tournament name
    const id = newTournament.name.toLowerCase().replace(/\s+/g, '-'); 

  let bannerImageUrl = '';

  if (newTournament.bannerImage) {
    try {
      console.log("Uploading image...");
      const storageRef = ref(storage, `tournamentBanners/${id}/${newTournament.bannerImage.name}`);
      const snapshot = await uploadBytes(storageRef, newTournament.bannerImage);
      bannerImageUrl = await getDownloadURL(snapshot.ref);
      console.log("Image uploaded successfully. URL:", bannerImageUrl);
    } catch (error) {
      console.error("Error uploading image: ", error);
      // Handle the error appropriately (e.g., show an error message to the user)
      return; // Exit the function if image upload fails
    }
  }

    // Convert date string to Firestore Timestamp
    const tournamentData = {
      ...newTournament,
      date: Timestamp.fromDate(new Date(newTournament.date)),
      id: id, // Add tournamentId to the data
      bannerImage: bannerImageUrl
    };

    try {
      // Use setDoc instead of addDoc to set a custom document ID
      await setDoc(doc(db, 'tournaments', id), tournamentData);
      setNewTournament({ 
        // Reset your form fields here
        name: '', 
        game: '', 
        date: '', 
        format: '', 
        region: '', 
        category: '',
        competitionStructure: '',
        eligibility: '',
        gameplayRules: '',
        generalRules: '',
        maxPlayersPerTeam: 0,
        numberOfTeams: 0, 
        officialRules: '',
        bannerImage: ''
      });
      fetchTournaments();
    } catch (error) {
      console.error("Error adding tournament: ", error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }

  };

  const removeTournament = async (id) => {
    await deleteDoc(doc(db, 'tournaments', id));
    fetchTournaments();
  };

  const addNewAward = async (e) => {
    e.preventDefault();
    const { id, name, category, description, image } = newAward;

    if (!id) {
      alert('Please provide an Award ID');
      return;
    }

    const storage = getStorage();
    const imageRef = ref(storage, `awards/${id}`);
    await uploadBytes(imageRef, image);
    const imageURL = await getDownloadURL(imageRef);

    await addAward(id, name, imageURL, category, description);

    setNewAward({ id: '', name: '', category: '', description: '', image: null });
    fetchAwards();
  };

  const removeAward = async (id) => {
    await deleteDoc(doc(db, 'awards', id));
    fetchAwards();
  };

  const assignAward = async (e) => {
    e.preventDefault();
    const { userId, awardId } = assignAwardData;

    if (!userId || !awardId) {
      alert('Please provide both User ID and Award ID');
      return;
    }

    await assignAwardToUser(userId, awardId);

    setAssignAwardData({ userId: '', awardId: '' });
    alert('Award assigned successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-6xl font-bold mb-8 text-center font-bebas">Admin Control</h1>
      
      <form onSubmit={addTournament} className="mb-8 bg-white shadow-lg rounded-lg p-6 text-black">
        <h2 className="text-2xl font-semibold mb-4">Add New Tournament</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={newTournament.name}
            onChange={handleInputChange}
            placeholder="Tournament Name"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="game"
            value={newTournament.game}
            onChange={handleInputChange}
            placeholder="Game"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="date"
            value={newTournament.date}
            onChange={handleInputChange}
            placeholder="Date"
            type="date"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="format"
            value={newTournament.format}
            onChange={handleInputChange}
            placeholder="Format"
            required
            className="p-2 border rounded text-black"
          />
          <div className="mb-4">
            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <input
              name="region"
              value={newTournament.region}
              onChange={handleInputChange}
              placeholder="region"
              required
              className="mt-1 p-2 border rounded text-black w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="maxPlayersPerTeam" className="block text-sm font-medium text-gray-700">
              Max Players Per Team <span className="text-red-500">*</span> {/* Required indicator */}
            </label>
            <input
              type="number"
              id="maxPlayersPerTeam"
              name="maxPlayersPerTeam"
              value={newTournament.maxPlayersPerTeam}
              onChange={handleInputChange}
              placeholder="Max Players Per Team"
              className="mt-1 p-2 border rounded text-black w-full" // Increased width
            />
          </div>
          <div className="mb-4">
            <label htmlFor="numberOfTeams" className="block text-sm font-medium text-gray-700">
              Number of Teams <span className="text-red-500">*</span> {/* Required indicator */}
            </label>
            <input
              type="number"
              id="numberOfTeams"
              name="numberOfTeams"
              value={newTournament.numberOfTeams}
              onChange={handleInputChange}
              placeholder="Number Of Teams"
              className="mt-1 p-2 border rounded text-black w-full" // Increased width
            />
          </div>
          <div className="mb-4">
            <label htmlFor="competitionStructure" className="block text-sm font-medium text-gray-700">
              Competition Structure
            </label>
            <textarea // Use textarea for larger input area
              id="competitionStructure"
              name="competitionStructure"
              value={newTournament.competitionStructure}
              onChange={handleInputChange}
              placeholder="Competition Structure"
              className="mt-1 p-2 border rounded text-black w-full h-24" // Increased height
            />
          </div>
          <div className="mb-4">
            <label htmlFor="eligibility" className="block text-sm font-medium text-gray-700">
              eligibility
            </label>
            <textarea // Use textarea for larger input area
              id="eligibility"
              name="eligibility"
              value={newTournament.eligibility}
              onChange={handleInputChange}
              placeholder="eligibility"
              className="mt-1 p-2 border rounded text-black w-full h-24" // Increased height
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gameplayRules" className="block text-sm font-medium text-gray-700">
              Gameplay Rules
            </label>
            <textarea // Use textarea for larger input area
              id="gameplayRules"
              name="gameplayRules"
              value={newTournament.gameplayRules}
              onChange={handleInputChange}
              placeholder="gameplayRules"
              className="mt-1 p-2 border rounded text-black w-full h-24" // Increased height
            />
          </div>
          <div className="mb-4">
            <label htmlFor="generalRules" className="block text-sm font-medium text-gray-700">
              General Rules
            </label>
            <textarea // Use textarea for larger input area
              id="generalRules"
              name="generalRules"
              value={newTournament.generalRules}
              onChange={handleInputChange}
              placeholder="generalRules"
              className="mt-1 p-2 border rounded text-black w-full h-24" // Increased height
            />
          </div>
          <div className="mb-4">
            <label htmlFor="officialRules" className="block text-sm font-medium text-gray-700">
              Official Rules
            </label>
            <textarea // Use textarea for larger input area
              id="officialRules"
              name="officialRules"
              value={newTournament.officialRules}
              onChange={handleInputChange}
              placeholder="officialRules"
              className="mt-1 p-2 border rounded text-black w-full h-24" // Increased height
            />
          </div>
          <select
            name="category"
            value={newTournament.category}
            onChange={handleInputChange}
            required
            className="p-2 border rounded text-black"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="file" // Use type="file" for image uploads
            name="bannerImage"
            accept="image/*" // Accept only image files
            onChange={handleInputChange}
            className="p-2 border rounded text-black"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Tournament</button>
      </form>

      <form onSubmit={addNewAward} className="mb-8 bg-white shadow-lg rounded-lg p-6 text-black">
        <h2 className="text-2xl font-semibold mb-4">Add New Award</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="id"
            value={newAward.id}
            onChange={handleAwardInputChange}
            placeholder="Award ID"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="name"
            value={newAward.name}
            onChange={handleAwardInputChange}
            placeholder="Award Name"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="category"
            value={newAward.category}
            onChange={handleAwardInputChange}
            placeholder="Category"
            required
            className="p-2 border rounded text-black"
          />
          <input
            name="description"
            value={newAward.description}
            onChange={handleAwardInputChange}
            placeholder="Description"
            required
            className="p-2 border rounded text-black"
          />
          <input
            type="file"
            onChange={handleAwardImageChange}
            required
            className="p-2 border rounded text-black"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Award</button>
      </form>

      <form onSubmit={assignAward} className="mb-8 bg-white shadow-lg rounded-lg p-6 text-black">
        <h2 className="text-2xl font-semibold mb-4">Assign Award to User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="userId"
            value={assignAwardData.userId}
            onChange={handleAssignAwardInputChange}
            placeholder="User ID"
            required
            className="p-2 border rounded text-black"
          />
          <select
            name="awardId"
            value={assignAwardData.awardId}
            onChange={handleAssignAwardInputChange}
            required
            className="p-2 border rounded text-black"
          >
            <option value="">Select Award</option>
            {awards.map(award => (
              <option key={award.id} value={award.id}>{award.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Assign Award</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {awards.map(award => (
          <div key={award.id} className="border p-6 rounded-lg shadow-lg bg-white text-black">
            <h2 className="text-3xl font-semibold mb-2 font-bebas">{award.name}</h2>
            <p className="text-gray-700 mb-1"><strong>Category:</strong> {award.category}</p>
            <p className="text-gray-700 mb-1"><strong>Description:</strong> {award.description}</p>
            <img src={award.imageURL} alt={award.name} className="w-full h-32 object-cover mb-2 rounded" />
            <button onClick={() => removeAward(award.id)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Award</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="border p-6 rounded-lg shadow-lg bg-white text-black">
            <h2 className="text-3xl font-semibold mb-2 font-bebas">{tournament.name}</h2>
            <p className="text-gray-700 mb-1"><strong>Game:</strong> {tournament.game}</p>
            <p className="text-gray-700 mb-1"><strong>Date:</strong> {tournament.date}</p>
            <p className="text-gray-700 mb-1"><strong>Format:</strong> {tournament.format}</p>
            <p className="text-gray-700 mb-1"><strong>Region:</strong> {tournament.region}</p>
            <p className="text-gray-700 mb-1"><strong>Category:</strong> {tournament.category}</p>
            <p className="text-gray-700 mb-1"><strong>Max Players:</strong> {tournament.maxPlayersPerTeam}</p>
            <p className="text-gray-700 mb-1"><strong>Number of Teams:</strong> {tournament.numberOfTeams}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href={`/groupInterface/${tournament.id}`}>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Team Formation</button>
              </Link>
              <Link href={`/bracketManagement/${tournament.id}`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Bracket Management</button>
              </Link>
              <button onClick={() => removeTournament(tournament.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Remove Tournament</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
