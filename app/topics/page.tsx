"use client"
import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '../components/SideBar';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Plus, Search } from 'lucide-react';
import CreateTopicModal from './createtopicModal';
import TopicCard from './component';

function TopicContent() {
    const searchParams = useSearchParams();
    const subjectId = searchParams.get('subjectId');
    const [subjectTitle, setSubjectTitle] = useState<string>('');
    const [topics, setTopics] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchTopics = async () => {
        if (!subjectId) return;
        setIsLoading(true);

        // Fetch Subject Title
        const { data: subjectData } = await supabase
            .from('subjects')
            .select('title')
            .eq('id', subjectId)
            .single();

        if (subjectData) {
            setSubjectTitle(subjectData.title);
        }

        // Fetch Topics
        const { data: topicsData } = await supabase
            .from('topics')
            .select('*')
            .eq('subject_id', subjectId)
            .order('title', { ascending: true });

        if (topicsData) {
            setTopics(topicsData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTopics();
    }, [subjectId]);

    return (
        <div className="p-6 md:p-12 w-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-blue-600 mb-2">{subjectTitle || 'Topics'}</h2>
                    <p className="text-blue-500 font-medium">/Lessons</p>
                </div>

                <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                    onClick={() => setIsModalOpen(true)}
                >
                    Upload New Topic
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Loading topics...</div>
            ) : topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map((topic) => (
                        <TopicCard
                            key={topic.id}
                            id={topic.id}
                            title={topic.title}
                            subtopic={topic.subtopic}
                            onEdit={() => console.log('Edit topic', topic.id)}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-4">
                        <Search className="w-12 h-12 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No topics found</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                        There are currently no topics created for this subject. Get started by uploading a new topic.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create your first topic
                    </button>
                </div>
            )}

            {subjectId && (
                <CreateTopicModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    subjectId={subjectId}
                    onSuccess={() => {
                        fetchTopics();
                    }}
                />
            )}
        </div>
    );
}

export default function TopicsPage() {
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
                <Suspense fallback={<div className="p-12">Loading...</div>}>
                    <TopicContent />
                </Suspense>
            </main>
        </div>
    )
}
