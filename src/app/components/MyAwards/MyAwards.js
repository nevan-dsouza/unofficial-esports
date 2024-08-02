import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const MyAwards = ({ awards, toggleFavorite }) => {
  const [selectedCategory, setSelectedCategory] = useState('showcase');
  const [selectedAward, setSelectedAward] = useState(null);
  const [awardsState, setAwardsState] = useState(awards);

  useEffect(() => {
    setAwardsState(awards); // Update state when awards prop changes
  }, [awards]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleAwardClick = (award) => {
    setSelectedAward(award);
  };

  const closePopup = () => {
    setSelectedAward(null);
  };

  const handleToggleFavorite = async (awardId) => {
    const updatedAwards = awardsState.map((award) =>
      award.id === awardId ? { ...award, favorite: !award.favorite } : award
    );
    setAwardsState(updatedAwards);
    await toggleFavorite(awardId);
  };

  const filteredAwards = selectedCategory === 'showcase'
    ? awardsState.filter((award) => award.favorite)
    : awardsState.filter((award) => award.category === selectedCategory);

  const isScrollable = filteredAwards.length > 10;

  // Debugging: Log filtered awards
  console.log('Filtered Awards:', filteredAwards);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-semibold font-bebas">My Awards</h2>
        <select
          className="bg-white text-black border border-black rounded-md p-2"
          onChange={(e) => handleCategoryChange(e.target.value)}
          value={selectedCategory}
        >
          <option value="showcase">Showcase</option>
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </select>
      </div>
      <div className={`grid grid-cols-2 gap-4 text-black sm:grid-cols-3 lg:grid-cols-5 ${isScrollable ? 'overflow-y-auto max-h-80' : ''}`}>
        {filteredAwards.length === 0 && (
          <div className="col-span-full text-xl font-rajdhani">
            {selectedCategory === 'showcase' ? 'No awards selected to display here.' : 'Play tournaments to collect awards!'}
          </div>
        )}
        {filteredAwards.map((award, index) => (
          <div
            key={index}
            className="relative w-full h-full transition-transform transform hover:-translate-y-1 rounded-lg overflow-hidden shadow-lg hover:cursor-pointer"
            style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
            onClick={() => handleAwardClick(award)}
          >
            <img
              src={award.imageURL}
              alt={award.name}
              className="w-full h-full object-cover rounded-lg hover:opacity-75"
              loading="lazy"
              sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl font-bebas opacity-0 hover:opacity-100">
              {award.name}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(award.id);
              }}
              className="absolute top-1 right-1 text-gray-200 hover:text-white"
            >
              {award.favorite ? <FaEye size={22} /> : <FaEyeSlash size={22} />}
            </button>
          </div>
        ))}
      </div>
      {selectedAward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg pt-6 pb-6 shadow-lg max-w-2xl w-full relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex justify-center items-center">
                <img src={selectedAward.imageURL} alt={selectedAward.name} className="w-60 h-auto object-cover rounded-lg" />
              </div>
              <div className='pr-8'>
                <h2 className="text-5xl font-semibold mb-2 font-bebas">{selectedAward.name}</h2>
                <p className="text-lg mb-2"><span className='font-rajdhani font-bold'>Category:</span> {selectedAward.category}</p>
                <p className="text-lg"><span className='font-rajdhani font-bold'>Description:</span></p>
                <p> {selectedAward.description}</p>
              </div>
            </div>
            <button
              onClick={closePopup}
              className="absolute bottom-6 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAwards;