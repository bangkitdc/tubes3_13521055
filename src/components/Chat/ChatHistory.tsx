import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Conversation from './Conversation';
import axios, { AxiosError } from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { toast } from "react-toastify";
import { Message } from '@/types';
import Profile from "@/../public/icons/person.svg";
import More from "@/../public/icons/more_vert.svg";
import Add from "@/../public/icons/add.svg";
import ChatBubble from "@/../public/icons/chat_bubble_outline.svg";
import Logout from "@/../public/icons/logout.svg";
import Delete from "@/../public/icons/delete.svg";
import Image from 'next/image';

interface Chat {
    label: string;
  }
  
  const ChatHistory: React.FC = () => {
    const [chatData, setChatData] = useState<Chat[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('algorithm1');
    const [allRooms, setAllRoom] = useState<number[]>([]);
    const [data, setData] = useState<Message[]>([]);
    const { data: session }: any = useSession();

    const convertToNumber = (label: string): number => {
      const chatNumber = label.split(' ')[1]; // split the string by space and get the second part
      return parseInt(chatNumber);
    };

    const handleChatClick = (label: string) => {
      const chatNumber = convertToNumber(label);
      setRoom(chatNumber);
    };

    const handleAlgorithmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedAlgorithm(event.target.value);
    };

    useEffect(() => {
      const fetchData = async () => {
        try {
          const senderId :string = session?.user?._id;
          const apiEndpoint = `/api/chat/message?senderId=${senderId}`;
          const apiRes = await axios.get(apiEndpoint);
          const data = apiRes.data.messages;
          const uniqueRooms: number[] = [];

          for (const message of data) {
            if (!uniqueRooms.includes(message.room)) {
              uniqueRooms.push(message.room);
            }
          }

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
    }, [session?.user?._id, data]);
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSignOut = () => {
      localStorage.removeItem("room");
      signOut({ callbackUrl: '/login' });
    };

    const [flag, setFlag] = useState(false);

    const handleChangeRoom = () => {
      setFlag(true);
    };

    const [room, setRoom] = useState(() => {
      if (typeof window !== "undefined") {
        const storedRoom = window.localStorage.getItem("room");
        if (storedRoom !== null) {
          return parseInt(storedRoom);
        }
      }
      return 0;
    });

    useEffect(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("room", room.toString());
      }
    }, [room]);

    const handleDeleteRoom = async () => {
      try {
        const senderId: string = session?.user?._id;
        const apiEndpoint = `/api/chat/message?senderId=${senderId}&roomNumber=${room}`;
        const apiRes = await axios.delete(apiEndpoint);

        if (apiRes?.data?.success) {
          localStorage.removeItem("room");

          setTimeout(() => {
            setRoom(Math.max(...allRooms));
          }, 100);

          setRoom(0);
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          toast.error(errorMsg);
        }
      }
    };

    useEffect(() => {
      if (allRooms.length > 0) {
        setRoom(Math.max(...allRooms) + 1);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flag]);

  return (
    <div className="grid grid-cols-5 h-screen w-screen bg-gray-50 dark:bg-gray-900">
      <div className=" h-full w-full col-span-1 py-5 dark:bg-gray-800">
        <div className="flex flex-col w-full h-full items-center">
          <div className="pl-5 pr-2 inner-shadow w-full">
            <div
              className="items-center py-3 px-4 mr-[20px] border-2 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold mb-5 cursor-pointer flex drop-shadow-sm"
              onClick={() => {
                setRoom(Math.max(...allRooms) + 1);
              }}
            >
              <Image src={Add} height={14} alt={""} />
              <p className="px-4">New Chat</p>
            </div>
          </div>
          <div className="pl-5 pr-2 w-full">
            <div className="max-h-[26rem] w-full overflow-y-scroll">
              {chatData
                .slice()
                .reverse()
                .map((chat) => (
                  <div
                    className={`py-3 px-4 border-2 ${
                      room == convertToNumber(chat.label)
                        ? "dark:bg-gray-600"
                        : "dark:bg-gray-800"
                    } dark:border-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold mb-3 w-full flex cursor-pointer drop-shadow-sm`}
                    key={chat.label}
                    onClick={() => handleChatClick(chat.label)}
                  >
                    <Image src={ChatBubble} height={18} alt={""} />
                    <Link className="px-4 w-full" href="/">
                      {chat.label}
                    </Link>
                    {room == convertToNumber(chat.label) && (
                      <button className="hover:bg-gray-700 rounded-2xl"
                      onClick={handleDeleteRoom}
                      >
                        <Image src={Delete} height={28} alt={""} />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-auto border-t-2 w-full border-gray-900 z-2">
            <div className="pt-[22px] w-full drop-shadow-sm pl-5 pr-7">
              <ul className="items-center px-2 w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-800 dark:text-white">
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-800">
                  <div className="flex items-center pl-3">
                    <input
                      type="radio"
                      id="algorithm1"
                      name="algorithm"
                      value="algorithm1"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
                      onChange={handleAlgorithmChange}
                      checked={selectedAlgorithm === "algorithm1"}
                    />
                    <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      KMP
                    </label>
                  </div>
                </li>
                <li className="w-full dark:border-gray-600">
                  <div className="flex items-center px-5">
                    <input
                      type="radio"
                      id="algorithm2"
                      name="algorithm"
                      value="algorithm2"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer"
                      onChange={handleAlgorithmChange}
                      checked={selectedAlgorithm === "algorithm2"}
                    />
                    <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      BM{" "}
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <div className="w-full pt-2 relative drop-shadow-sm pl-5 pr-7">
              {isDropdownOpen && (
                <div className="absolute bottom-[52px] z-30 drop-shadow-lg rounded-lg w-[208px] bg-gray-900">
                  <div className="py-2">
                    <button
                      className="cursor-pointer flex w-full px-4 py-1 text-sm hover:bg-gray-600 text-gray-200"
                      onClick={handleSignOut}
                    >
                      <Image src={Logout} height={24} alt={""} />
                      <p className="px-4">Log out</p>
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 h-11 items-center w-full text-stone-50 text-sm bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-800"
              >
                <Image src={Profile} height={24} alt={""} />
                <p className="px-4 text-stone-50 w-full text-left">
                  {session?.user?.name}
                </p>
                <Image src={More} height={24} alt={""} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-4">
        <Conversation
          selectedAlgorithm={selectedAlgorithm}
          room={room}
          maxRoom={Math.max(...allRooms)}
          onChangeRoom={handleChangeRoom}
        />
      </div>
    </div>
  );
};

export default ChatHistory;

