import React from 'react';

const Banner = () => {
  return (
    <div className="relative w-full h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: 'url(/homepage/banner.png)' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black flex flex-col items-center justify-center">
        <div className="relative text-center z-10">
          <span className="absolute text-white text-3xl font-rajdhani font-bold bg-black inline-block px-4 py-4 -top-16 right-0">
            SEPTEMBER 2024
          </span>
          <h1 className="text-white text-8xl font-bebas bg-black inline-block px-4 py-2">
            THE UNOFFICIAL OPEN CUP
          </h1>
          <span className="absolute text-white text-3xl font-bold bg-black inline-block px-4 py-4 -bottom-16 left-0">
            US 🇺🇸 & CANADA 🇨🇦
          </span>
        </div>
      </div>
      <div className="absolute inset-0 blur-border"></div>
    </div>
  );
};

export default Banner;
