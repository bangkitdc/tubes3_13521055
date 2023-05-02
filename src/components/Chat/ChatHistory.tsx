import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Conversation from './Conversation';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from "react-toastify";

interface Chat {
    label: string;
  }
  
  const ChatHistory: React.FC = () => {
    const [chatData, setChatData] = useState<Chat[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('algorithm1');
    const [room, setRoom] = useState(-1);
    const [dataPost, setDataPost] = useState<Message[]>([]);
    const [allRooms, setAllRoom] = useState<number[]>();
    const [data, setData] = useState<Message[]>([]);
    const { data: session }: any = useSession();

     // klo pake ini dia ngebug garagara labelnya bisa ga unik jadi kek doble2 berkali2
    // const addChat = () => {
    //   setChatData([...chatData, { label: `Chat ${chatData.length + 1}` }]);
    // };

    // tapi kayanya kalo api ga pake ini deh (pakenya yg atas) tp sok maneh coba
    const addChat = () => {
      let newLabel = `Chat ${chatData.length + 1}`;
      
      // Check if label already exists in chatData
      while (chatData.some(chat => chat.label === newLabel)) {
        newLabel = `Chat ${parseInt(newLabel.split(' ')[1]) + 1}`;
      }
    
      setChatData([...chatData, { label: newLabel }]);
    };

    const convertToNumber = (label: string): number => {
      const chatNumber = label.split(' ')[1]; // split the string by space and get the second part
      return parseInt(chatNumber);
    };

    const handleChatClick = (label: string) => {
      const chatNumber = convertToNumber(label);
      setRoom(chatNumber);
    };

    useEffect(() => {
      const temp: Message[] = [];
      for (const message of data){
        if(message.room === room){
          temp.push(message);
        }
      }
      setDataPost(temp);
    }, [room, dataPost]);

    const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedAlgorithm(event.target.value);
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          // const senderId :string = session?.user?._id;
          // const apiEndpoint = `/api/chat/message?senderId=${senderId}`;
          // const apiRes = await axios.get(apiEndpoint);
          // const data = apiRes.data.messages;
          const senderId :string = session?.user?._id;
          const apiEndpoint = `/api/chat/message?senderId=${senderId}`;
          const apiRes = await axios.get(apiEndpoint);
          const data: Message[] = [
            { text: 'Hello!', role: 'receiver', room: 5 , sender: '!'},
            { text: 'Hi there!', role: 'sender', room: 4 , sender: '!'},
            { text: 'How are you?', role: 'sender', room: 8 , sender: '!'},
            { text: 'I am doing well, thank you. How about you?', role: 'receiver', room: 2 , sender: '!'},
            { text: 'I am good too!', role: 'sender', room: 3, sender: '!' },
            { text: 'That\'s great to hear.', role: 'receiver', room: 4 , sender: '!'}
          ];
          const uniqueRooms: number[] = [];

          for (const message of data) {
            if (!uniqueRooms.includes(message.room)) {
              uniqueRooms.push(message.room);
            }
          }

          // switch (chatData.length) {
          //   case 4:
          //     alert('4');
          //     break;
          //   case 5:
          //     alert('5');
          //     break;
          //   default:
          //     alert(chatData.length);
          // }    

          const newChatData = uniqueRooms.map((room) => ({ label: `Chat ${room}`}));
          setChatData(newChatData);
          setAllRoom(uniqueRooms);
          setData(data);
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            const errorMsg = error.response?.data?.error;
            toast.error(errorMsg);
          }
        }
      };
      fetchData();
    }, [session?.user?._id]);

    //sori aing komen biar bisa jalan pake dummy dulu
    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const senderId: string = session?.user?._id;
    //       const apiEndpoint = `/api/chat/message?senderId=${senderId}&roomNumber=${room}`;
    //       const apiRes = await axios.get(apiEndpoint);
    //       const data = apiRes.data.messages;
    //       setDataPost(data);
    //     } catch (error: unknown) {
    //       if (error instanceof AxiosError) {
    //         const errorMsg = error.response?.data?.error;
    //         toast.error(errorMsg);
    //       }
    //     }
    //   };
    //   fetchData();
    // }, [room, session?.user?._id]);
    

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
        <Conversation selectedAlgorithm={selectedAlgorithm} data={dataPost} room={room}/>
      </div>
    </div>
    
  );
};

export default ChatHistory;

