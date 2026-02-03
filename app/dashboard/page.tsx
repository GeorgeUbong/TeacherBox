"use client"
import React, { useState } from 'react';
import Sidebar from '../components/SideBar';
import LessonUp from './dashcomponents/Uploads';
import Users from './dashcomponents/users';
import RecentUploads from './dashcomponents/RecentUploads';
import { createClient } from '@/utils/supabase/client';
import { Suspense } from "react";





export default function Dash() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-white min-h-screen">
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                type="button"
                className={`fixed top-4 left-4 z-50 inline-flex items-center p-2 sm:hidden bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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

            {/* Sidebar with mobile toggle */}
            <div
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform sm:sticky sm:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <Sidebar hideMobileButton isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            <main className="flex-1 bg-white text-black mt-10">
                <div className="p-6 md:p-12">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-gray-600 mb-8">Welcome to your dashboard</p>

                    <section className="space-y-8">
                        {/* Lessons Uploaded Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <LessonUp />
                            </div>

                            {/* Metrics Grid */}
                            <div className="lg:col-span-2">
                                <Users />
                            </div>
                        </div>
                    </section>

                    {/* Recent uploads table (placeholder) */}
                    <section className="mt-8">
                        <RecentUploads />


                    </section>

                    <section>

                    </section>
                </div>
            </main>
        </div>
    )
}