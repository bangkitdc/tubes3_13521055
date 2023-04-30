import React from 'react';

type Props = {
  userMessages: Message[];
  botMessages: Message[];
  lastDisplayedUserMessageIndex: number;
  lastDisplayedBotMessageIndex: number;
};

const Messages: React.FC<Props> = ({
  userMessages,
  botMessages,
  lastDisplayedUserMessageIndex,
  lastDisplayedBotMessageIndex,
}) => {
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

  return <>{renderedMessages}</>;
};

export default Messages;
