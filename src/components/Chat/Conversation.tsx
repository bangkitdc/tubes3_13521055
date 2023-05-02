import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Messages from './Messages';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

interface Message {
  sender: string;
  text: string;
  role: string;
  room: number;
}

interface ConversationProps {
  selectedAlgorithm: string;
  data: Message[];
  room: number;
}

const Conversation = ({ selectedAlgorithm, data, room }: ConversationProps): JSX.Element => {
  const router = useRouter();

  const [userMessagesHistory, setUserMessagesHistory] = useState<Message[]>([]);
  const [botMessagesHistory, setBotMessagesHistory] = useState<Message[]>([]);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  const userMessagesRef = useRef<HTMLDivElement>(null);
  const botMessagesRef = useRef<HTMLDivElement>(null);

  const [lastDisplayedUserMessageIndexHistory, setLastDisplayedUserMessageIndexHistory] = useState<number>(-1);
  const [lastDisplayedBotMessageIndexHistory, setLastDisplayedBotMessageIndexHistory] = useState<number>(-1);
  const [lastDisplayedUserMessageIndex, setLastDisplayedUserMessageIndex] = useState<number>(-1);
  const [lastDisplayedBotMessageIndex, setLastDisplayedBotMessageIndex] = useState<number>(-1);
  const [dataAdded, setDataAdded] = useState<boolean>(false);
  
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMessage(event.target.value);
  }
  
  const { data: session }: any = useSession();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentMessage !== '') {
      // Switch statement to select appropriate response
      setUserMessages([...userMessages, {
        sender: session?.user._id,
        room: room,
        role: "sender",
        text: currentMessage,
      }]);
      try {
        const apiRes = await axios.post("/api/chat/message", {
          sender: session?.user._id,
          room: room,
          role: "sender",
          text: currentMessage,
        });
        if (apiRes?.data?.success) {
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          toast.error(errorMsg);
        }
      }
    }
    setCurrentMessage('');
    sendMessage();
  }

  const sendMessage = async () => {
    const input = document.getElementById('message-input') as HTMLInputElement;
    const text = input.value;
    if (!text) return;
    input.value = '';

    try {
      const apiRes = await axios.get(
        "/api/data/qna"
      );
      if (apiRes?.data?.success) {
        setBotMessages([...botMessages, { sender:apiRes.data.messages[0].sender , text: apiRes.data.messages[0].answer, role: 'receiver' , room: 1}]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const userMessagesElement = userMessagesRef.current;
    const botMessagesElement = botMessagesRef.current;
    if (userMessagesElement) {
      userMessagesElement.scrollIntoView({ behavior: "smooth" });
    }
    if (botMessagesElement) {
      botMessagesElement.scrollIntoView({ behavior: "smooth" });
    }
    
  }, [userMessages, botMessages]);

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

  return (
    <div className="conversation flex flex-col gap-2 py-5 h-screen">
      <div
        className="messages flex-grow-1 flex flex-col pl-5 px-1 row-span-9 overflow-y-scroll"
        ref={userMessagesRef}
      >
        <Messages
          userMessages={userMessagesHistory}
          botMessages={botMessagesHistory}
          lastDisplayedUserMessageIndex={lastDisplayedUserMessageIndexHistory}
          lastDisplayedBotMessageIndex={lastDisplayedBotMessageIndexHistory}
          history={true}
        />
        <Messages
          userMessages={userMessages}
          botMessages={botMessages}
          lastDisplayedUserMessageIndex={lastDisplayedUserMessageIndex}
          lastDisplayedBotMessageIndex={lastDisplayedBotMessageIndex}
          history={false}
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
            className="flex-1 rounded-lg py-2.5 pb-[11px] px-4 text-sm font-medium dark:bg-gray-800 dark:border-gray-900 text-stone-50 focus:outline-none"
            ref={callbackRef}
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-2 py-2.5 pb-[11px] px-4 dark:bg-gray-800 dark:border-gray-900 rounded-lg text-stone-50 font-medium hover:bg-gray-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
  };  
  

export default Conversation;
