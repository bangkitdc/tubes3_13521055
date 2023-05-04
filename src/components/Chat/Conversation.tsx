import { useState, useEffect, useRef, useCallback } from 'react';
import Typewriter, { TypewriterClass } from 'typewriter-effect';
import axios, { AxiosError } from 'axios';
import Messages from './Messages';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { Message } from '@/types';
import Image from 'next/image';
import Send from "@/../public/icons/send.svg";
import QuestionMark from "@/../public/icons/question_mark.svg";
import Code from "@/../public/icons/code.svg";
import Warning from "@/../public/icons/warning_amber.svg";

interface ConversationProps {
  selectedAlgorithm: string;
  data: Message[];
  room: number;
  maxRoom: number;
  onChangeRoom: () => void;
}

const Conversation = ({ selectedAlgorithm, data, room, maxRoom, onChangeRoom }: ConversationProps): JSX.Element => {
  const [userMessagesHistory, setUserMessagesHistory] = useState<Message[]>([]);
  const [botMessagesHistory, setBotMessagesHistory] = useState<Message[]>([]);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const userMessagesRef = useRef<HTMLDivElement>(null);
  const botMessagesRef = useRef<HTMLDivElement>(null);
  const botMessagesRef2 = useRef<HTMLDivElement>(null);

  const [lastDisplayedUserMessageIndexHistory, setLastDisplayedUserMessageIndexHistory] = useState<number>(-1);
  const [lastDisplayedBotMessageIndexHistory, setLastDisplayedBotMessageIndexHistory] = useState<number>(-1);
  const [lastDisplayedUserMessageIndex, setLastDisplayedUserMessageIndex] = useState<number>(-1);
  const [lastDisplayedBotMessageIndex, setLastDisplayedBotMessageIndex] = useState<number>(-1);

  const [readyToEnter, setReadyToEnter] = useState(true);
  
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMessage(event.target.value);
  }
  
  const { data: session }: any = useSession();

  useEffect(() => {
    setTimeout(() => {
      const botMessagesElement = botMessagesRef.current;
      if (botMessagesElement) {
        botMessagesElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  }, [room]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (currentMessage !== '' && readyToEnter) {
      setReadyToEnter(false);
      
      if (room == 0) {
        onChangeRoom();
      }

      const dataPost: Message = {
        sender: session?.user._id,
        room: room == 0 ? maxRoom + 1 : room,
        role: "sender",
        text: currentMessage,
      };
      setUserMessages([...userMessages, dataPost]);
      try {
        const apiRes = await axios.post("/api/chat/message", dataPost);
        if (apiRes?.data?.success) {
          
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          toast.error(errorMsg);
        }
      } finally {
        setCurrentMessage("");
        sendMessage();
      }
    }
  }

  const sendMessage = async () => {
    try {
      const qs = require("qs");
      const algoString = selectedAlgorithm === "algorithm1" ? "kmp" : "bm";
      const encodedMessage = qs.stringify(
        { string: currentMessage, algo: algoString },
        { encode: true, arrayFormat: "repeat" }
      );
      const apiRes = await axios.get(`/api/data/qna?${encodedMessage}`);

      if (apiRes?.data?.success) {
        if (room == 0) {
          onChangeRoom();
        }
        const dataPost: Message = {
          sender: session?.user._id,
          room: room == 0 ? maxRoom + 1 : room,
          role: "receiver",
          text: apiRes.data.ret.answer,
        };
        setBotMessages([...botMessages, dataPost]);
        
        const apiPost = await axios.post("/api/chat/message", dataPost);
        if (apiPost?.data?.success) {

        }
      }

    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMsg = error.response?.data?.error;
        toast.error(errorMsg);
      }
    }
  };

  // ini misah dummy data ke user sm bot
  useEffect(() => {
    const userMsg: Message[] = [];
    const botMsg: Message[] = [];
    data.forEach((d) => {
      if (d.role === "sender") {
        userMsg.push(d);
      } else {
        botMsg.push(d);
      }
    });
    setUserMessagesHistory(userMsg);
    setBotMessagesHistory(botMsg);
    setUserMessages([]);
    setBotMessages([]);
  }, [data]);

  useEffect(() => {
    const botMessagesElement = botMessagesRef.current;
    if (botMessagesElement) {
      botMessagesElement.scrollIntoView({ behavior: "smooth" });
    }
    
  }, [userMessages, botMessages, readyToEnter]);

  useEffect(() => {
    if (userMessagesHistory.length > lastDisplayedUserMessageIndexHistory) {
      setLastDisplayedUserMessageIndexHistory(userMessagesHistory.length);
    }
    if (botMessagesHistory.length > lastDisplayedBotMessageIndexHistory) {
      setLastDisplayedBotMessageIndexHistory(botMessagesHistory.length);
    }
  }, [userMessagesHistory, botMessagesHistory, lastDisplayedUserMessageIndexHistory, lastDisplayedBotMessageIndexHistory]);

  useEffect(() => {
    if (userMessages.length > lastDisplayedUserMessageIndex) {
      setLastDisplayedUserMessageIndex(userMessages.length);
    }
    if (botMessages.length > lastDisplayedBotMessageIndex) {
      setLastDisplayedBotMessageIndex(botMessages.length);
    }
  }, [userMessages, botMessages, lastDisplayedUserMessageIndex, lastDisplayedBotMessageIndex]);

  const callbackRef = useCallback((inputElement: any) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const handleMessageReady = () => {
    setReadyToEnter(true);
  };

  const handleInit = (typewriter: TypewriterClass) => {
    typewriter
      .pauseFor(500)
      .typeString("Hello World!")
      .pauseFor(2000)
      .deleteChars(6)
      .pauseFor(500)
      .typeString("All :)")
      .pauseFor(2000)
      .deleteAll()
      .pauseFor(1000)
      .typeString("Ask something . . .")
      .pauseFor(5000)
      .start();
  };

  return (
    <div className="conversation flex flex-col gap-2 py-5 h-screen">
      <div
        className="messages flex-grow-1 flex flex-col pl-5 px-1 row-span-9 overflow-y-scroll"
        ref={userMessagesRef}
      >
        {userMessages.length == 0 &&
          botMessages.length == 0 &&
          userMessagesHistory.length == 0 &&
          botMessagesHistory.length == 0 && (
            <div className="container h-screen items-center flex flex-col gap-12 justify-center">
              <div className="text-stone-50 text-center text-5xl">
                <Typewriter
                  onInit={handleInit}
                  options={{
                    autoStart: true,
                    delay: 100,
                    loop: true,
                    cursor: "",
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 w-full px-32">
                <div className="flex flex-col">
                  <div className="flex flex-col justify-center items-center h-full">
                    <Image src={QuestionMark} height={24} alt={""} />
                    <p className="text-lg text-stone-50 text-center pt-1">
                      Examples
                    </p>
                  </div>
                  <div className="grid grid-rows-3 gap-4 mt-4">
                    <button
                      className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 hover:bg-gray-600 cursor-pointer"
                      onClick={() =>
                        setCurrentMessage("Apa ibukota Indonesia?")
                      }
                    >
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>
                          <b>Question Prompts :</b>
                        </p>
                        <p>{'"Apa ibukota Indonesia?"'}</p>
                      </div>
                    </button>

                    <button
                      className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 hover:bg-gray-600 cursor-pointer"
                      onClick={() => setCurrentMessage("(2 ^ 6) / 2 + 16 * 2")}
                    >
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>
                          <b>Simple Math Prompts :</b>
                        </p>
                        <p>{'"(2 ^ 6) / 2 + 16 * 2"'}</p>
                      </div>
                    </button>

                    <button
                      className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 hover:bg-gray-600 cursor-pointer"
                      onClick={() => setCurrentMessage("Hari apa 17/08/1945?")}
                    >
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>
                          <b>Date Prompts :</b>
                        </p>
                        <p>{'"Hari apa 17/08/1945?"'}</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col justify-center items-center h-full">
                    <Image src={Code} height={24} alt={""} />
                    <p className="text-lg text-stone-50 text-center pt-1">
                      Algorithms
                    </p>
                  </div>
                  <div className="grid grid-rows-2 gap-4 mt-4 pb-2">
                    <div className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 row-span-2">
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>
                          <b>Knuth-Morris-Pratt (KMP)</b>
                        </p>
                        <p>
                          {
                            "Teknik pencocokan string matching dengan prefix function"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800">
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>
                          <b>Boyer-Moore (BM)</b>
                        </p>
                        <p>
                          {
                            "Teknik pencocokan string dengan heuristik (tanpa memeriksa ulang)"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col justify-center items-center h-full">
                    <Image src={Warning} height={24} alt={""} />
                    <p className="text-lg text-stone-50 text-center pt-1">
                      Limitations
                    </p>
                  </div>
                  <div className="grid grid-rows-3 gap-4 mt-4">
                    <div className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800">
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>{"Mungkin memberikan informasi yang salah"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800">
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>{"Pertanyaan harus eksak, kemiripan minimal 90%"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800">
                      <div className="p-4 text-sm text-stone-50 text-center">
                        <p>{"Data set terbatas dan tidak general"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        <Messages
          userMessages={userMessagesHistory}
          botMessages={botMessagesHistory}
          lastDisplayedUserMessageIndex={lastDisplayedUserMessageIndexHistory}
          lastDisplayedBotMessageIndex={lastDisplayedBotMessageIndexHistory}
          history={true}
          onMessageReady={handleMessageReady}
        />
        <div ref={botMessagesRef2} />
        <Messages
          userMessages={userMessages}
          botMessages={botMessages}
          lastDisplayedUserMessageIndex={lastDisplayedUserMessageIndex}
          lastDisplayedBotMessageIndex={lastDisplayedBotMessageIndex}
          history={false}
          onMessageReady={handleMessageReady}
        />
        <div ref={botMessagesRef} />
      </div>
      <div className="inputchat mt-auto row-span-1 border-t-2 pt-5 px-5 border-gray-800">
        <form className="prompt flex" onSubmit={handleFormSubmit}>
          <input
            id="message-input"
            type="text"
            value={currentMessage}
            onChange={handleInputChange}
            placeholder="Send a message."
            className="flex-1 rounded-lg py-2.5 pb-[11px] px-4 text-sm font-medium dark:bg-gray-800 dark:border-gray-900 text-stone-50 focus:outline-none drop-shadow-sm"
            ref={callbackRef}
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-2 py-2.5 pb-[11px] px-2.5 dark:bg-gray-800 dark:border-gray-900 rounded-lg text-stone-50 font-medium hover:bg-gray-700 drop-shadow-sm"
          >
            <Image
              className="rotate-[-45deg]"
              src={Send}
              height={20}
              alt={""}
            />
          </button>
        </form>
      </div>
    </div>
  );
  };  
  

export default Conversation;
