'use client'
import React from 'react';
import { BsChatDotsFill } from "react-icons/bs";
import { LuRefreshCcwDot } from "react-icons/lu";
import { MdHelpOutline } from "react-icons/md";
import { MdInstallDesktop } from "react-icons/md";
import { MdNotificationsOff } from "react-icons/md";
import { IoSparklesSharp } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";
import { LuChevronsUpDown } from "react-icons/lu";
import { BsCircleFill } from 'react-icons/bs';
const ChatHeader = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b h-14 w-full">
      {/* Title */}
      <div className="font-semibold text-lg text-gray-400 flex items-center gap-3">
        <BsChatDotsFill className="text-lg text-gray-400" />
        chats
        </div>
      {/* Action Buttons */}
      <div className="flex items-center space-x-3 p-2 ">
        {/* Refresh Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 gap-2 text-gray-800">
          <LuRefreshCcwDot className="text-xl text-gray-800" />
          Refresh
        </button>
        {/* Help Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 gap-2 text-gray-800">
          <MdHelpOutline className="text-xl text-gray-800" />
          Help
        </button>
        {/* Change Phone Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 gap-2 text-gray-800">
          5/6 Phones
          <LuChevronsUpDown className="text-xl text-gray-800" />
        </button>
        {/* Download Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 text-gray-800">
          <MdInstallDesktop className="text-xl text-gray-800" />
        </button>
        {/* Notification Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 text-gray-800">
          <MdNotificationsOff className="text-xl text-gray-800" />
        </button>
        {/* Menu Button */}
        <button className="flex items-center justify-center rounded hover:bg-gray-100 transition border border-gray-200 px-4 py-2.5 gap-2">
          <IoSparklesSharp className="text-xl text-yellow-300" />
          <FaListUl className="text-xl text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;