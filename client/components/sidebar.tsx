'use client'
import React from 'react'
import { AiFillHome } from "react-icons/ai";
import { IoIosSettings } from "react-icons/io";
import { IoTicketOutline } from "react-icons/io5";
import { FaChartLine, FaListUl } from "react-icons/fa";
import { HiMegaphone } from "react-icons/hi2";
import { BsChatDotsFill } from "react-icons/bs";
import { RiContactsBookFill, RiFolderImageFill } from "react-icons/ri";
import { MdChecklist } from "react-icons/md";
import { TbStarsFilled } from "react-icons/tb";
import { LuPanelLeftOpen } from "react-icons/lu";
import { IoIosGitNetwork } from "react-icons/io";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/app/context/SidebarContext';

const iconColor = "#0b8c4a";
const baseColor = "#5a6473"

export default function Sidebar() {
    const { selected, setSelected } = useSidebar();
    const router = useRouter();

    const handleNavigation = (item: string) => {
        setSelected(item);
        if (item === 'chat') {
            router.push('/chat');
        } else {
            router.push('/not-found');
        }
    };

    return (
        <nav className="flex flex-col justify-between h-screen py-2 bg-white w-14 border-r">
            {/* Top stack: Logo + 11 icons */}
            <div className="flex flex-col items-center">
                <div className="mb-4">
                    <button
                        className="p-1 rounded bg-transparent transition-colors duration-150 hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] active:bg-[#f5f5f5] flex items-center justify-center w-10 h-10"
                        aria-label="Logo"
                        tabIndex={0}
                        type="button"
                    >
                        <Image src="/assets/periskope_logo.jpeg" alt="logo" width={40} height={40} className="w-10 h-10" />
                    </button>
                </div>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'home' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('home')}
                    aria-label="Home"
                    onMouseDown={e => e.preventDefault()}
                >
                    <AiFillHome size={20} color={selected === 'home' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <hr className="w-10 border-gray-200 mb-1" />
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'chat' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('chat')}
                    aria-label="Chat"
                    onMouseDown={e => e.preventDefault()}
                >
                    <BsChatDotsFill size={20} color={selected === 'chat' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'ticket' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('ticket')}
                    aria-label="Ticket"
                    onMouseDown={e => e.preventDefault()}
                >
                    <IoTicketOutline size={20} color={selected === 'ticket' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'chart' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('chart')}
                    aria-label="Chart"
                    onMouseDown={e => e.preventDefault()}
                >
                    <FaChartLine size={20} color={selected === 'chart' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <hr className="w-10 border-gray-200 mb-1" />
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'list' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('list')}
                    aria-label="List"
                    onMouseDown={e => e.preventDefault()}
                >
                    <FaListUl size={20} color={selected === 'list' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'megaphone' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('megaphone')}
                    aria-label="Megaphone"
                    onMouseDown={e => e.preventDefault()}
                >
                    <HiMegaphone size={20} color={selected === 'megaphone' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'network' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('network')}
                    aria-label="Network"
                    onMouseDown={e => e.preventDefault()}
                >
                    <IoIosGitNetwork size={20} color={selected === 'network' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <hr className="w-10 border-gray-200 mb-1" />
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'notebook' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('notebook')}
                    aria-label="Notebook"
                    onMouseDown={e => e.preventDefault()}
                >
                    <RiContactsBookFill size={20} color={selected === 'notebook' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'image' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('image')}
                    aria-label="Image"
                    onMouseDown={e => e.preventDefault()}
                >
                    <RiFolderImageFill size={20} color={selected === 'image' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <hr className="w-10 border-gray-200 mb-1" />
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'checklist' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('checklist')}
                    aria-label="Checklist"
                    onMouseDown={e => e.preventDefault()}
                >
                    <MdChecklist size={20} color={selected === 'checklist' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'settings' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('settings')}
                    aria-label="Settings"
                    onMouseDown={e => e.preventDefault()}
                >
                    <IoIosSettings size={20} color={selected === 'settings' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
            </div>
            {/* Bottom stack: Stars and Panel */}
            <div className="flex flex-col items-center mb-2">
                <button
                    className={`mb-2 p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'stars' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('stars')}
                    aria-label="Stars"
                    onMouseDown={e => e.preventDefault()}
                >
                    <TbStarsFilled size={20} color={selected === 'stars' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
                <button
                    className={`p-1 rounded bg-transparent transition-colors duration-150 ${selected === 'panel' ? 'bg-[#f5f5f5]' : ''} w-10 h-10 flex items-center justify-center`}
                    onClick={() => handleNavigation('panel')}
                    aria-label="Panel"
                    onMouseDown={e => e.preventDefault()}
                >
                    <LuPanelLeftOpen size={20} color={selected === 'panel' ? iconColor : baseColor} className="sidebar-icon" />
                </button>
            </div>
            <style jsx>{`
                .sidebar-icon {
                    transition: color 0.2s;
                }
                button:hover,
                button:focus,
                button:active {
                    background: #f5f5f5 !important;
                }
                button:hover .sidebar-icon,
                button:focus .sidebar-icon {
                    color: ${iconColor} !important;
                }
            `}</style>
        </nav>
    )
}
