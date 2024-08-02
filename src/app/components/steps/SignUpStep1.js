import React, { useState } from 'react';

const SignUpStep1 = ({ onNext, error, formData }) => {
  const [email, setEmail] = useState(formData.email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/wallpaper-omen.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative w-11/12 max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center text-center md:text-left text-white">
          <h1 className="text-7xl font-bebas font-bold mb-4">CREATE AN ACCOUNT</h1>
          <p className="text-xl">We have lots in store for you, thanks for joining us!</p>
        </div>
        <div className="w-full max-w-md bg-white p-8 rounded-md shadow-md text-black">
          <h1 className="text-5xl font-semibold text-center font-bebas">What's your email?</h1>
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md mt-4"
            >
              Next
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep1;
