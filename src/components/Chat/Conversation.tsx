import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Messages from './Messages';
import { useSession } from 'next-auth/react';

interface Message {
  text: string;
  role: 'user' | 'bot';
}

const Conversation = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const userMessagesRef = useRef<HTMLDivElement>(null);
  const botMessagesRef = useRef<HTMLDivElement>(null);
  const [lastDisplayedUserMessageIndex, setLastDisplayedUserMessageIndex] = useState<number>(-1);
  const [lastDisplayedBotMessageIndex, setLastDisplayedBotMessageIndex] = useState<number>(-1);

  const { data: session }: any = useSession();

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMessage(event.target.value);
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentMessage !== '') {
      setUserMessages([...userMessages, { text: currentMessage, role: 'user' }]);
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
        setBotMessages([...botMessages, { text: apiRes.data.messages[0].answer, role: 'bot' }]);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while sending the message.');
    }
  };

  useEffect(() => {
    const userMessagesElement = userMessagesRef.current;
    const botMessagesElement = botMessagesRef.current;
    if (userMessagesElement) {
      userMessagesElement.scrollTop = userMessagesElement.scrollHeight;
    }
    if (botMessagesElement) {
      botMessagesElement.scrollTop = botMessagesElement.scrollHeight;
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
        className="messages flex-grow-1 flex flex-col row-span-9"
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
