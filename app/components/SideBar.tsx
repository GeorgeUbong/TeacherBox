'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Star,
    ChevronDown,
    X,
    BookOpen
} from 'lucide-react';
import Image from 'next/image';
import img from '../assets/logo.png'
import { createClient } from '@/utils/supabase/client'

export default function Sidebar({ hideMobileButton = false, isSidebarOpen = false, setIsSidebarOpen }: { hideMobileButton?: boolean; isSidebarOpen?: boolean; setIsSidebarOpen?: (state: boolean) => void }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [grades, setGrades] = useState<any[]>([])
    const pathname = usePathname()
    const supabase = createClient()

    const fetchGrades = async () => {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .order('created_at', { ascending: true }) // Updated sorting here
        if (data) {
            setGrades(data)
        }
    }

    useEffect(() => {
        fetchGrades()

        // Realtime listener: Updates sidebar immediately when grades are added/deleted elsewhere
        const channel = supabase
            .channel('sidebar-sync')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'grades' },
                () => {
                    fetchGrades()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <>
            {/* Mobile Hamburger Button */}
            {!hideMobileButton && (
                <button
                    onClick={() => setIsSidebarOpen?.(!isSidebarOpen)}
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
            )}

            <aside
                id="sidebar-multi-level-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white text-[#267CD1] border-r border-default ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link href={'/'} onClick={() => setIsSidebarOpen?.(false)}>
                                <Image
                                    alt='logo'
                                    className='pb-10 mx-auto'
                                    src={img}
                                    height={200}
                                    width={200}
                                />
                            </Link>
                        </li>

                        {/* Dashboard */}
                        <li>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsSidebarOpen?.(false)}
                                className={`flex items-center px-2 py-1.5 text-body rounded-base 
                                    transition-colors ${pathname === '/dashboard'
                                    ? 'bg-blue-100 text-blue-600 '
                                    : 'hover:bg-blue-100 hover:text-fg-brand group'
                                    }`}
                            >
                                <LayoutDashboard className="w-8 h-8 transition duration-75 text-[#267CD1]" />
                                <span className="ms-3 text-[#267CD1] text-2xl">Dashboard</span>
                            </Link>
                        </li>

                        <div className='p-4'></div>

                        {/* Manage Grades Page */}
                        <li>
                            <Link
                                href="/grade"
                                onClick={() => setIsSidebarOpen?.(false)}
                                className={`flex items-center mb-12 px-2 py-1.5 text-body 
                                    rounded-base transition-colors ${pathname === '/grade'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'hover:bg-blue-100 hover:text-fg-brand group'
                                    }`}
                            >
                                <BookOpen className="w-6 h-6 transition duration-75 text-[#267CD1]" />
                                <span className="ms-3 text-[#267CD1] text-xl">Grade Manager</span>
                            </Link>
                        </li> 

                        {/* Grades Dropdown List */}
                        <li>
                            <button
                                type="button"
                                className="flex items-center justify-between w-full px-2 py-1.5 text-body rounded-base hover:bg-neutral-tertiary hover:text-fg-brand group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="flex items-center">
                                    <Star className="shrink-0 w-6 h-6 transition duration-75 group-hover:text-fg-brand" />
                                    <span className="flex-1 ms-3 text-left whitespace-nowrap text-2xl">Grades</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <ul className={`py-2 space-y-2 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                                {grades.map((grade) => (
                                    <li key={grade.id}>
                                        <Link
                                            href={`/grades?id=${grade.id}`}
                                            onClick={() => setIsSidebarOpen?.(false)}
                                            className={`flex items-center pl-10 px-2 py-1.5 rounded-base hover:bg-[#DBEAFE] hover:text-fg-brand group text-xl transition-colors ${
                                                pathname.includes(grade.id) ? 'text-blue-700 font-bold bg-blue-50' : 'text-[#267CD1]'
                                            }`}
                                        >
                                            {grade.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    )
}