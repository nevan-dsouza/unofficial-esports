import React from 'react';

const HowItWorks = () => {
  return (
    <div className="bg-black-100 py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-6xl font-bebas mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-4">
            <img src="/homepage/1.png" alt="Step 1" className="mx-auto" />
          </div>
          <div className="p-4">
            <img src="/homepage/2.png" alt="Step 2" className="mx-auto" />
          </div>
          <div className="p-4">
            <img src="/homepage/3.png" alt="Step 3" className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
