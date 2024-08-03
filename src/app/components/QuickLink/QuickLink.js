'use client';

import React, { useState } from 'react';

const QuickLink = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full flex items-center bg-black text-white p-4">
      <div className="flex-grow text-4xl font-bebas">
        <p>PLAY IN THE UNOFFICIAL OPEN CUP TOURNAMENT NOW!</p>
      </div>
      <div className="flex items-center">
      <button className="bg-red-600 text-white px-6 py-4 text-2xl font-bold hover:bg-red-500 h-full" style={{ backgroundColor: '#e42d3e' }}>
          <a href="/tournaments/the-unofficial-open-cup-2024">REGISTER</a>
        </button>
        <button onClick={() => setIsVisible(false)} className="text-white-400 hover:text-gray-200 text-2xl ml-4">&times;</button>
      </div>
    </div>
  );
};

export default QuickLink;
