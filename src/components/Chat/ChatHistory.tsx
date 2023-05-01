import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Conversation from './Conversation';

interface Chat {
    label: string;
  }
  
  const ChatHistory: React.FC = () => {
    const [chatData, setChatData] = useState<Chat[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
    const [selectedChat, setSelectedChat] = useState<string | null>();
  
    const addChat = () => {
      setChatData([...chatData, { label: `Chat ${chatData.length + 1}` }]);
    };

    const handleChatClick = (label: string) => {
      setSelectedChat(label);
    };

    const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedAlgorithm(event.target.value);
    };

    // pass ke conversation
    const dummyConversation = [
      { text: 'Hello!', role: 'receiver', room: 2 },
      { text: 'Hi there!', role: 'sender', room: 2 },
      { text: 'How are you?', role: 'sender', room: 2 },
      { text: 'I am doing well, thank you. How about you?', role: 'receiver', room: 2 },
      { text: 'I am good too!', role: 'sender', room: 2 },
      { text: 'That\'s great to hear.', role: 'receiver', room: 2 }
    ];

  return (
    <div className='grid grid-cols-5 h-screen w-screen bg-gray-50 dark:bg-gray-900'>
        <div className=" h-full w-full col-span-1 py-5 pl-5 pr-2 dark:bg-gray-800">
          <div className="flex flex-col w-full h-full items-center">
            <div
              className="chat-label py-3 mr-[20px] w-[208px] border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-lg text-white font-bold mb-5 cursor-pointer flex justify-center"
              onClick={addChat}>
              Add New Chat
            </div>
            <div className="max-h-96 w-full overflow-y-scroll">
              {chatData.slice().reverse().map((chat) => (
                <div
                  className="chat-label py-3 px-8 border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-lg text-white font-bold mb-3 w-full flex justify-center"
                  key={chat.label}
                  onClick={() => handleChatClick(chat.label)}
                >
                  <Link href="/">{chat.label}</Link>
                </div>
              ))}
            </div>
            <div className="mt-auto mr-[20px] w-[208px]">
              <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-800 dark:text-white">
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-800">
                  <div className="flex items-center pl-3">
                    <input
                      type="radio"
                      id="algorithm1"
                      name="algorithm"
                      value="algorithm1"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
                      onChange={handleAlgorithmChange}
                      checked={selectedAlgorithm === 'algorithm1'}
                    />
                    <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      KMP
                    </label>
                  </div>
                </li>
                <li className="w-full dark:border-gray-600">
                  <div className="flex items-center pl-3">
                    <input
                      type="radio"
                      id="algorithm2"
                      name="algorithm"
                      value="algorithm2"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
                      onChange={handleAlgorithmChange}
                      checked={selectedAlgorithm === 'algorithm2'}
                    />
                    <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      BM{" "}
                    </label>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      <div className="col-span-4">
        <Conversation selectedAlgorithm={selectedAlgorithm} data={dummyConversation}/>
      </div>
    </div>
    
  );
};

export default ChatHistory;

