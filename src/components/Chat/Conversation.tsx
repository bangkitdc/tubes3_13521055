import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Messages from './Messages';
import { useSession } from 'next-auth/react';

interface Message {
  text: string;
  role: string;
  room: number;
}

interface ConversationProps {
  selectedAlgorithm: string;
  dummyData: Message[];
}

const Conversation = ({ selectedAlgorithm, dummyData }: ConversationProps): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const userMessagesRef = useRef<HTMLDivElement>(null);
  const botMessagesRef = useRef<HTMLDivElement>(null);
  const [lastDisplayedUserMessageIndex, setLastDisplayedUserMessageIndex] = useState<number>(-1);
  const [lastDisplayedBotMessageIndex, setLastDisplayedBotMessageIndex] = useState<number>(-1);
  const [dummyDataAdded, setDummyDataAdded] = useState<boolean>(false);
  const { data: session }: any = useSession();

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMessage(event.target.value);
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentMessage !== '') {
      setUserMessages([...userMessages, { text: currentMessage, role: 'sender' , room: 1}]);
      // Switch statement to select appropriate response
      let response = '';
      switch (selectedAlgorithm) {
        case 'algorithm1':
          alert('Response from kmp');
          break;
        case 'algorithm2':
          alert('Response from bm');
          break;
        default:
          alert('haha ga mencet lu');
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
        setBotMessages([...botMessages, { text: apiRes.data.messages[0].answer, role: 'receiver' , room: 1}]);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while sending the message.');
    }
  };

  // ini misah dummy data ke user sm bot
  useEffect(() => {
    const userMessages: Message[] = [];
    const botMessages: Message[] = [];
    dummyData.forEach((data) => {
      if (data.role === "sender") {
        userMessages.push(data);
      } else {
        botMessages.push(data);
      }
    });
    setUserMessages(userMessages);
    setBotMessages(botMessages);
  }, [dummyData]);

  useEffect(() => {
    const userMessagesElement = userMessagesRef.current;
    const botMessagesElement = botMessagesRef.current;
    if (userMessagesElement) {
      userMessagesElement.scrollIntoView()
    }
    if (botMessagesElement) {
      botMessagesElement.scrollIntoView()
    }
    
  }, [userMessages, botMessages]);

  useEffect(() => {
    if (userMessages.length > lastDisplayedUserMessageIndex) {
      setLastDisplayedUserMessageIndex(userMessages.length - 1);
    }
    if (botMessages.length > lastDisplayedBotMessageIndex) {
      setLastDisplayedBotMessageIndex(botMessages.length - 1);
    }
  }, [userMessages, botMessages, lastDisplayedUserMessageIndex, lastDisplayedBotMessageIndex]);

  const callbackRef = useCallback((inputElement: any) => {
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  return (
    <div className="conversation flex-col h-full grid grid-rows-10 gap-5">
      <div
        className="messages flex-grow-1 flex flex-col row-span-9 scrolled-chat"
        ref={userMessagesRef}
      >
        <Messages
          userMessages={userMessages}
          botMessages={botMessages}
          lastDisplayedUserMessageIndex={lastDisplayedUserMessageIndex}
          lastDisplayedBotMessageIndex={lastDisplayedBotMessageIndex}
        />
        <div ref={botMessagesRef} />
      </div>
      <div className="inputchat mt-auto row-span-1">
        <form className="prompt flex" onSubmit={handleFormSubmit}>
          <input
            id="message-input"
            type="text"
            value={currentMessage}
            onChange={handleInputChange}
            placeholder="Send a message."
            className="flex-1 rounded-lg py-2.5 pb-[11px] px-4 text-sm font-medium dark:bg-gray-800 dark:border-gray-900 text-stone-50 focus:outline-none"
            ref={callbackRef}
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
