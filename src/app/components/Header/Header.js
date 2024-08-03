// components/Header.js
'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { AuthContext } from '../../context/authContext';

const Header = () => {
  const { user, userRole } = useContext(AuthContext);
  const pathname = usePathname();

  const getLinkClass = (path) => {
    return pathname === path ? 'text-red-500' : 'hover:text-red-500 transition duration-300';
  };

  return (
    <header className="p-4 bg-black text-white flex justify-between items-center">
      <Link href="/" className="text-4xl mx-6 font-bebas">Unofficial Esports</Link>
      <Link href="/" className="text-4xl mx-6 font-bebas">Unofficial Esports</Link>
      <nav className="space-x-4 font-bebas text-2xl">
        <Link href="/tournaments" className={getLinkClass('/tournaments')}>Tournaments</Link>
        <Link href="/standings" className={getLinkClass('/standings')}>Standings</Link>
        <Link href="/vods" className={getLinkClass('/vods')}>VODs</Link>
        <Link href="/shop" className={getLinkClass('/shop')}>Shop</Link>
        {user ? (
          <>
            <Link href="/profile" className={getLinkClass('/profile')}>Profile</Link>
            {user && userRole === 'admin' && (
              <Link href="/adminControl" className={getLinkClass('/adminControl')}>
                Admin Control
              </Link>
            )}
          </>
        ) : (
          <Link href="/signin" className={getLinkClass('/signin')}>Sign In</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;