import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setCurrentMessage(event.target.value);
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentMessage !== '') {
      setUserMessages([...userMessages, {  text: currentMessage, role: 'user' }]);
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
      const response = await fetch('/api/chatbot/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setBotMessages([...botMessages, {  text: data.response, role: 'bot' }]);
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

  const renderedMessages: JSX.Element[] = [];

  for (let i = 0; i < userMessages.length || i < botMessages.length; i++) {
    if (i <= lastDisplayedUserMessageIndex && i < userMessages.length) {
      renderedMessages.push(
        <div key={`user-${i}`} className="message-user right">
          <div className="bg-red-400 rounded-lg p-2">{userMessages[i].text}</div>
        </div>
      );
    }
    if (i <= lastDisplayedBotMessageIndex && i < botMessages.length) {
      renderedMessages.push(
        <div key={`bot-${i}`} className="message-bot left">
          <div className="bg-blue-300 rounded-lg p-2">{botMessages[i].text}</div>
        </div>
      );
    }
  }
  
    return (
      <div className='wrapper h-full'>
      <div className="conversation flex-1 flex flex-col">
        <div className="message-user flex flex-col" ref={userMessagesRef}>
          {renderedMessages}
        </div>
      </div>
      <div className="inputchat">
        <form className="prompt flex" onSubmit={handleFormSubmit}>
            <input
              id="message-input"
              type="text"
              value={currentMessage}
              onChange={handleInputChange}
              placeholder="Type your message"
              className="flex-1 rounded-full py-2 px-4 bg-yellow-400 text-black focus:outline-none"
            />
            <button type='submit' className="ml-2 py-2 px-4 bg-yellow-400 rounded-full text-black font-bold">Send</button>
        </form>
      </div>
    </div>    
    );
  };  
  

export default Conversation;
