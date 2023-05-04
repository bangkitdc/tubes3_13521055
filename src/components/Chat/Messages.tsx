import React from 'react';
import Typewriter, { TypewriterClass } from 'typewriter-effect';
import { Message } from '@/types';

type Props = {
  userMessages: Message[];
  botMessages: Message[];
  lastDisplayedUserMessageIndex: number;
  lastDisplayedBotMessageIndex: number;
  history: boolean;
  onMessageReady: () => void;
};

const Messages: React.FC<Props> = ({
  userMessages,
  botMessages,
  lastDisplayedUserMessageIndex,
  lastDisplayedBotMessageIndex,
  history,
  onMessageReady
}) => {
  const renderedMessages: JSX.Element[] = [];
  
  for (let i = 0; i < userMessages.length || i < botMessages.length; i++) {
    if (i <= lastDisplayedUserMessageIndex && i < userMessages.length) {
      renderedMessages.push(
        <div key={`user-${i}`} className="message-user right p-4 drop-shadow-md">
          <div className="bg-sky-800 text-stone-50 rounded-lg p-2 whitespace-pre-line">
              {userMessages[i].text}
          </div>
        </div>
      );
    }
    if (i <= lastDisplayedBotMessageIndex && i < botMessages.length) {
      const handleInit = (typewriter:TypewriterClass) => {
        typewriter
          .pauseFor(500)
          .typeString(botMessages[i].text)
          .callFunction(() => {
            onMessageReady();
          })
          .start();
      };

      renderedMessages.push(
        <div key={`bot-${i}`} className="message-bot left p-4 drop-shadow-md">
          <div className="bg-sky-700 text-stone-50 rounded-lg p-2 whitespace-pre-line">
            {history && 
              botMessages[i].text
            }
            {!history && 
              <Typewriter
              onInit={handleInit}
              options={{
                autoStart:false,
                delay: 50,
                cursor: ""
              }}
            />
            }
          </div>
        </div>
      );
    }
  }

  return <>{renderedMessages}</>;
};

export default Messages;
