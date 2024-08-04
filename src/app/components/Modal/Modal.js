import React, { useState } from 'react';

const Modal = ({ show, onClose, onConfirm, title, inputValue, setInputValue, handleGenerateLink, shareableLink, currentIndex }) => {
  const [activeTab, setActiveTab] = useState('username');
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-1/3 text-black">
        <h2 className="text-4xl mb-4 font-bebas">{title}</h2>
        <div className="mb-4">
          <button 
            className={`px-4 py-2 ${activeTab === 'username' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} 
            onClick={() => setActiveTab('username')}
          >
            Username
          </button>
          <button 
            className={`px-4 py-2 ml-2 ${activeTab === 'link' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} 
            onClick={() => setActiveTab('link')}
          >
            Shareable Link
          </button>
        </div>
        {activeTab === 'username' && (
          <div>
            <input
              type="text"
              placeholder="Enter player username"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        )}
        {activeTab === 'link' && (
          <div>
            <p className="mb-4">Generate and share this link with the player you want to invite:</p>
            <input
              type="text"
              readOnly
              value={shareableLink}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <button
              onClick={handleGenerateLink}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Generate Link
            </button>
            {shareableLink && (
              <div className="mt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(shareableLink)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-lg mr-2">Close</button>
          {activeTab === 'username' && (
            <button onClick={onConfirm} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Confirm</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
