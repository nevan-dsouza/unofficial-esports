'use client'

import React, { useState } from 'react';
import Banner from './components/Banner/Banner';
import QuickLink from './components/QuickLink/QuickLink';
import { FaUserPlus, FaTrophy, FaHandsHelping, FaQuestionCircle, FaBullseye, FaUsers, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs = [
    { question: 'What is Unofficial Esports?', answer: 'Unofficial Esports is a platform where gamers can join tournaments, compete, and connect with other players in the esports community.' },
    { question: 'How do I join a tournament?', answer: 'To join a tournament, you need to create an account, browse the available tournaments, and register for the one that suits your skill level and region.' },
    { question: 'Can I participate as a solo player?', answer: 'Yes, you can join as a solo player. You can either form a team with friends or join solo and we will help you find a team.' },
    { question: 'What are the rules for tournaments?', answer: 'Each tournament has its own set of rules which you can find on the tournament details page. Make sure to read them before registering.' },
    { question: 'How can I track my progress?', answer: 'You can track your progress through the Player Standings page, where you can see your ranking and compare it with other players.' },
    { question: 'How do I provide feedback or report issues?', answer: 'We value your feedback! Join our Discord server to provide suggestions, report issues, and help us improve the platform.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Banner />
      <div id="get-started" className="py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-6xl font-bebas mb-8">Get Started with Unofficial Esports</h2>
          <p className="text-lg mb-8">
            Join the exciting world of competitive gaming with our easy-to-follow steps. Whether you're a seasoned pro or new to the scene, we've got you covered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/signin">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaUserPlus size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Create an Account</h3>
                <p className="text-lg text-center">Sign up and create your profile to get started. It's quick and easy!</p>
              </div>
            </Link>
            <Link href="/tournaments">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaTrophy size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Join Tournaments</h3>
                <p className="text-lg text-center">Browse and join tournaments that suit your skill level and region.</p>
              </div>
            </Link>
            <Link href="/standings">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaBullseye size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Player Standings</h3>
                <p className="text-lg text-center">See where you stand among other players and track your progress.</p>
              </div>
            </Link>
            <Link href="#about">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaInfoCircle size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">About Us</h3>
                <p className="text-lg text-center">Learn more about our mission and what we plan to do next.</p>
              </div>
            </Link>
            <Link href="#community">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaUsers size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Community</h3>
                <p className="text-lg text-center">Join our community to connect with other players and share your experiences.</p>
              </div>
            </Link>
            <Link href="#faq">
              <div className="p-4 flex flex-col items-center bg-gray-800 rounded-lg shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:bg-gray-700">
                <FaQuestionCircle size={80} className="text-red-500 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">FAQs</h3>
                <p className="text-lg text-center">Have questions? Check out our FAQ section for more information.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div id="about" className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-6xl font-bebas mb-8">Who We Are</h2>
          <p className="text-xl mb-8">
            We are a group of passionate gamers and esports enthusiasts dedicated to providing the best online tournament experience. Our mission is to create a platform where players of all skill levels can compete, improve, and connect with others.
          </p>
          <p className="text-xl mb-8">
            Next, we plan to expand our tournament offerings, introduce new features for team management, and build a vibrant community where players can share their achievements and stories.
          </p>
        </div>
      </div>
      <div id="community" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-6xl font-bebas mb-8">Community</h2>
          <p className="text-xl mb-8">
            Join our Discord server to connect with other players, share your experiences, and get the latest updates. We value your feedback and look forward to growing together with the community.
          </p>
          <p className="text-xl mb-8">
            Our goal is to build a platform that truly caters to the needs of the gaming community. Your insights and suggestions are crucial in helping us achieve this. Let’s create something amazing together!
          </p>
        </div>
      </div>
      <div id="faq" className="py-16 bg-gray-800 text-white transition duration-300">
        <div className="container mx-auto">
          <h2 className="text-6xl font-bebas mb-8 text-center">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-900 p-4 rounded-lg shadow-lg cursor-pointer" onClick={() => toggleQuestion(index)}>
                <h3 className={`text-3xl font-bebas mb-2 flex justify-between items-center ${activeQuestion === index ? 'text-red-500' : ''}`}>
                  {faq.question}
                  <span>{activeQuestion === index ? '-' : '+'}</span>
                </h3>
                {activeQuestion === index && <p className="text-lg transition duration-300">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <QuickLink />
      <div className="flex-grow"></div>
    </div>
  );
}
