import React, { useState } from 'react';

const SignUpStep3 = ({ onNext, onBack }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ username });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/wallpaper-omen.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Optional overlay for readability */}
      <div className="relative w-11/12 max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center text-center md:text-left text-white">
          <h1 className="text-7xl font-bebas font-bold mb-4">CREATE AN ACCOUNT</h1>
        </div>
      <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md text-black">
        <h1 className="text-4xl font-semibold text-center font-bebas">Choose a Username</h1>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default SignUpStep3;