import Link from 'next/link';
import React, { useState } from 'react';

interface Chat {
    label: string;
  }
  
  const ChatHistory: React.FC = () => {
    const [chatData, setChatData] = useState<Chat[]>([]);
  
    const addChat = () => {
      setChatData([...chatData, { label: `Chat ${chatData.length + 1}` }]);
    };

    const handleAlgorithmChange = () => {
      setAlgorithm(algorithm == 0 ? 1 : 0);
    };

    const [algorithm, setAlgorithm] = useState(0);
  return (
    <div className=" h-full w-full">
      <div className="flex flex-col w-full h-full items-center">
        <div
          className="chat-label py-3 mr-[20px] w-[208px] border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-lg text-white font-bold mb-5 cursor-pointer flex justify-center"
          onClick={addChat}
        >
          Add New Chat
        </div>
        <div className="max-h-96 w-full overflow-y-scroll">
          {chatData.slice().reverse().map((chat) => (
            <div
              className="chat-label py-3 px-8 border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-lg text-white font-bold mb-3 w-full flex justify-center"
              key={chat.label}
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
                  checked={algorithm == 0}
                  onChange={() => handleAlgorithmChange()}
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
                  checked={algorithm == 1}
                  onChange={() => handleAlgorithmChange()}
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
  );
};

export default ChatHistory;

