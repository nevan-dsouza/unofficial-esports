import React, { useState, useEffect } from 'react';
import { firestore } from '../../lib/firebaseConfig';
import { useAuth } from '../../context/authContext';

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = firestore.collection('chats').doc(teamId).collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, [teamId]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      await firestore.collection('chats').doc(teamId).collection('messages').add({
        user: user.email,
        message: newMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setNewMessage('');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
      <div className="mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.user}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded"
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
      </div>
    </div>
  );
};

export default TeamChat;
