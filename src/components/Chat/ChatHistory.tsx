import React, { useState } from 'react';

interface Chat {
    label: string;
  }
  
  const ChatHistory: React.FC = () => {
    const [chatData, setChatData] = useState<Chat[]>([]);
  
    const addChat = () => {
      setChatData([...chatData, { label: `Chat ${chatData.length + 1}` }]);
    };
  return (
    <div className=" h-full w-full overflow-y-auto ">
      <div className="flex flex-col w-full h-full items-center">
        <div className="chat-label py-3 px-8 border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-2xl text-white font-bold mb-5 cursor-pointer w-full flex justify-center" onClick={addChat}>
          Add New Chat
        </div>
        <div className="max-h-full w-full test">
          {chatData.map((chat) => (
            <div className="chat-label py-3 px-8 border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-400 rounded-2xl text-white font-bold mb-3 w-full flex justify-center" key={chat.label}>
              <a href="/">{chat.label}</a>
            </div>
          ))}
        </div>
        <div className="radio-group w-full flex-grow-1 flex-col justify-center mt-auto px-8 border-2 dark:bg-gray-400 dark:border-gray-700 rounded-2xl hover-gray-800 text-white font-bold ">
          <div className="radio-item flex justify-center ">
            <input type="radio" id="algorithm1" name="algorithm" value="algorithm1" />
            <label htmlFor="algorithm1">KMP</label>
          </div>
          <div className="radio-item flex justify-center">
            <input type="radio" id="algorithm2" name="algorithm" value="algorithm2" />
            <label htmlFor="algorithm2">ANJ</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;

