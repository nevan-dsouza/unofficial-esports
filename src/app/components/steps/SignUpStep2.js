// src/app/components/steps/SignUpStep2.js
'use client';

import React, { useState } from 'react';

const SignUpStep2 = ({ onNext, onBack, formData }) => {
  const [day, setDay] = useState(formData.birthdate ? formData.birthdate.split('/')[0] : '');
  const [month, setMonth] = useState(formData.birthdate ? formData.birthdate.split('/')[1] : '');
  const [year, setYear] = useState(formData.birthdate ? formData.birthdate.split('/')[2] : '');

  const handleDayChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setDay(value);
      if (value.length === 2) {
        document.getElementById('monthInput').focus();
      }
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setMonth(value);
      if (value.length === 2) {
        document.getElementById('yearInput').focus();
      }
    }
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    if (value.length <= 4) {
      setYear(value);
    }
  };

  const handleSubmit = () => {
    onNext({ birthdate: `${day}/${month}/${year}` });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/wallpaper-omen.jpeg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Optional overlay for readability */}
      <div className="relative w-11/12 max-w-7xl mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center text-center md:text-left text-white">
          <h1 className="text-7xl font-bebas font-bold mb-4">CREATE AN ACCOUNT</h1>
        </div>
        <div className="bg-white shadow-md rounded-lg p-8 max-w-sm w-full text-center">
          <h2 className="text-5xl font-semibold mb-4 text-black font-bebas">When were you born?</h2>
          <div className="flex space-x-4 mb-8">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1 font-bebas text-2xl">DAY</label>
              <input
                type="text"
                value={day}
                onChange={handleDayChange}
                className="w-full p-2 border border-gray-300 rounded-md text-center text-black"
                placeholder="DD"
                maxLength="2"
                id="dayInput"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1 font-bebas text-2xl">MONTH</label>
              <input
                type="text"
                value={month}
                onChange={handleMonthChange}
                className="w-full p-2 border border-gray-300 rounded-md text-center text-black"
                placeholder="MM"
                maxLength="2"
                id="monthInput"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1 font-bebas text-2xl">YEAR</label>
              <input
                type="text"
                value={year}
                onChange={handleYearChange}
                className="w-full p-2 border border-gray-300 rounded-md text-center text-black"
                placeholder="YYYY"
                maxLength="4"
                id="yearInput"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep2;