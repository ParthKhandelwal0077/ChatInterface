import React from 'react';
import ChatHeader from '../../../components/ChatHeader';
import ChatList from '../../../components/ChatList';

export default async function ChatPage() {
 

    return (
      <div className="h-screen flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex">
          <ChatList />
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <h1 className="text-gray-500">Select a chat to start messaging</h1>
          </div>
        </div>
      </div>
    );
  
} 