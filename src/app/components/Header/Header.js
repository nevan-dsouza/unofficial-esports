'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../../context/authContext';

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="p-4 bg-black text-white flex justify-between items-center">
      <Link href="/"><h1 className="text-4xl mx-6 font-bebas">Unofficial Esports</h1></Link>
      <nav className="space-x-4 font-bebas text-2xl">
        <Link href="/tournaments" className="hover:text-red-500">Tournaments</Link>
        <Link href="/standings" className="hover:text-red-500">Standings</Link>
        <Link href="/vods" className="hover:text-red-500">VODs</Link>
        <Link href="/rewards" className="hover:text-red-500">Rewards</Link>
        <Link href="/profile" className="hover:text-red-500">Profile</Link>
        <Link href="/adminControl" className="hover:text-red-500">Admin Control</Link>
      </nav>
    </header>
  );
};

export default Header;
