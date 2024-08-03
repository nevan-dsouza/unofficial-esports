import React, { useState } from 'react';

const SignUpStep5 = ({ onNext, onBack }) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must agree to the terms and conditions');
      return;
    }
    onNext({});
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/wallpaper-omen.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Optional overlay for readability */}
      <div className="relative w-11/12 max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center text-center md:text-left text-white">
          <h1 className="text-7xl font-bebas font-bold mb-4">CREATE AN ACCOUNT</h1>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md text-black">
          <h1 className="text-4xl font-semibold text-center font-bebas">Terms of Service</h1>
          <div className="mt-8 mb-4 overflow-y-scroll h-64 border border-gray-300 p-2">
            {/* Add your terms of service content here */}
            <p>Last Modified: September 15, 2023</p>
            <p>Greetings players,</p>
            <p>These terms of service (the “Terms”) set out the terms and conditions by which Riot Games offers you access to use and enjoy our games, apps, websites, and other services (the “Riot Services”).</p>
            <p>...</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agreed" className="block text-sm font-medium text-gray-700">
                I agree to the Terms of Service and have read and acknowledge the Privacy Notice
              </label>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
                Accept
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep5;