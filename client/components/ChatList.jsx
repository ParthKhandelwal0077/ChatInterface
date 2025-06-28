import React from 'react';
import { MdFilterList } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { MdOutlineFilterAlt } from "react-icons/md";

const ChatList = () => {
  // Sample chat data based on the screenshot
  const chats = [
    {
      id: 1,
      name: "Test Skope Final 5",
      message: "Support2: This doesn't go on Tuesday...",
      phone: "+91 99718 44008 +1",
      time: "Yesterday",
      status: "Demo",
      avatar: "👤",
      unread: 0
    },
    {
      id: 2,
      name: "Periskope Team Chat",
      message: "Periskope: Test message",
      phone: "+91 99718 44008 +3",
      time: "28-Feb-25",
      status: "Demo",
      statusColor: "internal",
      avatar: "🟢",
      unread: 1
    },
    {
      id: 3,
      name: "+91 99999 99999",
      message: "Hi there, I'm Swapnika, Co-Founder of ...",
      phone: "+91 92898 65999 +1",
      time: "25-Feb-25",
      status: "Demo",
      statusColor: "Signup",
      avatar: "👤",
      unread: 0
    },
    {
      id: 4,
      name: "Test Demo17",
      message: "Rohosen: 123",
      phone: "+91 99718 44008 +1",
      time: "25-Feb-25",
      status: "Demo",
      statusColor: "Content",
      avatar: "🟤",
      unread: 0
    },
    {
      id: 5,
      name: "Test El Centro",
      message: "Roshnag: Hello, Ahmadport!",
      phone: "+91 99718 44008",
      time: "04-Feb-25",
      status: "Demo",
      avatar: "👤",
      unread: 0
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <button className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md border border-green-200 text-sm">
            <MdFilterList className="text-lg" />
            Custom filter
          </button>
          <button className="px-3 py-2 text-gray-600 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
            Save
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-200 text-sm">
            <MdOutlineFilterAlt className="text-lg" />
            Filtered
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div key={chat.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                {chat.avatar}
              </div>
              
              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{chat.name}</h3>
                    {chat.statusColor && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        chat.statusColor === 'internal' ? 'bg-green-100 text-green-700' :
                        chat.statusColor === 'Signup' ? 'bg-blue-100 text-blue-700' :
                        chat.statusColor === 'Content' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {chat.statusColor}
                      </span>
                    )}
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{chat.time}</span>
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-1">{chat.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{chat.phone}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {chat.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 