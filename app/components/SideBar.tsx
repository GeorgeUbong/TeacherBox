// components/Sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    Star,
    ChevronDown,
    X,

} from 'lucide-react';
import Image from 'next/image';
import img from '../assets/logo.png'

export default function Sidebar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-controls="sidebar-multi-level-sidebar"
                type="button"
                className="inline-flex items-center p-2 mt-3 ms-3 text-heading bg-transparent border border-transparent rounded-base hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary sm:hidden"
            >
                <span className="sr-only">Open sidebar</span>
                <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2"
                        d="M5 7h14M5 12h14M5 17h10"
                    />
                </svg>
            </button>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}


            <aside
                id="sidebar-multi-level-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white text-black border-r border-default ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto">
                    <ul className="space-y-2 font-medium">
                       <Link href={'/'}>
                        <Image
                            alt='logo'
                            className='pb-10'
                            src={img}
                            height={200}
                            width={200}
                        /></Link>
                        {/* Dashboard */}
                        <li>
                            <Link
                                href="/dashboard"
                                className="flex items-center px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                            >
                                <LayoutDashboard className="w-5 h-5 transition duration-75 group-hover:text-fg-brand " />
                                <span className="ms-3">Dashboard</span>
                            </Link>
                        </li>
                        <div className='p-4'></div>
                        {/* E-commerce Dropdown */}
                        <li>
                            <button
                                type="button"
                                className="flex items-center justify-between w-full px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="flex items-center">
                                    <Star className="shrink-0 w-5 h-5 transition duration-75 group-hover:text-fg-brand" />
                                    <span className="flex-1 ms-3 text-left whitespace-nowrap">Grades</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown content */}
                            <ul
                                id="dropdown-example"
                                className={`py-2 space-y-2 ${isDropdownOpen ? 'block' : 'hidden'}`}
                            >
                                <li>
                                    <Link
                                        href="#"
                                        className="flex items-center pl-10 px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                                    >
                                        Jss 1
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="flex items-center pl-10 px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                                    >
                                        Jss 2
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="flex items-center pl-10 px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                                    >
                                        Jss 3
                                    </Link>
                                </li>
                            </ul>
                        </li>


                    </ul>
                </div>
            </aside>
        </>
    )
}