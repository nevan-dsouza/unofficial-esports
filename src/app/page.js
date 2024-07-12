import React from 'react';
import Banner from './components/Banner/Banner';
import QuickLink from './components/QuickLink/QuickLink';
import HowItWorks from './components/HowItWorks/HowItWorks';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Banner />
      <HowItWorks />
      <QuickLink />
      <div className="flex-grow"></div>
    </div>
  );
}
