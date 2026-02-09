"use client"
import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '../components/SideBar';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Plus, Search, BookOpen } from 'lucide-react';
import CreateLessonModal from './createlessonModal';
import LessonCard from './component';

function LessonContent() {
    const searchParams = useSearchParams();
    const topicId = searchParams.get('topicId');
    const [topicTitle, setTopicTitle] = useState<string>('');
    const [hierarchy, setHierarchy] = useState<{ grade: string, subject: string } | null>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchLessons = async () => {
        if (!topicId) return;
        setIsLoading(true);

        // Fetch Topic Title
        const { data: topicData } = await supabase
            .from('topics')
            .select('title, subject_id')
            .eq('id', topicId)
            .single();

        if (topicData) {
            setTopicTitle(topicData.title);

            // Fetch subject and grade
            const { data: subjectData } = await supabase
                .from('subjects')
                .select('title, grade_id')
                .eq('id', topicData.subject_id)
                .single();

            if (subjectData) {
                const { data: gradeData } = await supabase
                    .from('grades')
                    .select('name')
                    .eq('id', subjectData.grade_id)
                    .single();

                setHierarchy({
                    grade: gradeData?.name || 'Unknown Grade',
                    subject: subjectData.title
                });
            }
        }

        // Fetch Lessons
        const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('topic_id', topicId)
            .order('title', { ascending: true });

        if (lessonsData) {
            setLessons(lessonsData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLessons();
    }, [topicId]);

    const handleEdit = (lesson: any) => {
        setEditingLesson(lesson);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingLesson(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-12 w-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[#267CD1] mb-2">{topicTitle || 'Lessons'}</h2>
                    <p className="text-[#267CD1] font-medium">{hierarchy?.grade} / {hierarchy?.subject} / {topicTitle}</p>
                </div>

                <button
                    className="flex items-center gap-1 md:gap-2 bg-[#267CD1] 
               text-white px-4 py-1.5 md:px-6 md:py-2.5 
               text-sm md:text-base rounded-full 
               hover:bg-blue-700 transition-colors 
               font-medium shadow-sm hover:shadow-md"
                    onClick={handleAddNew}
                >
                    Upload New Lesson
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="loader-wrapper">
                    <div className="loader">
                        <div className="jimu-primary-loading" />
                    </div>
                </div>
            ) : lessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map((lesson) => (
                        <LessonCard
                            key={lesson.id}
                            id={lesson.id}
                            title={lesson.title}
                            content={lesson.content}
                            type={lesson.media_type === 'video' ? 'video' : 'pdf'}
                            onEdit={() => handleEdit(lesson)}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-4">
                        <BookOpen className="w-12 h-12 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No lessons found</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                        There are currently no lessons uploaded for this topic. Start by uploading a new lesson.
                    </p>
                    <button
                        onClick={handleAddNew}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Upload your first lesson
                    </button>
                </div>
            )}
            
            {/* Modal */}
            {topicId && (
                <CreateLessonModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingLesson(null);
                    }}
                    topicId={topicId}
                    initialData={editingLesson}
                    onSuccess={() => {
                        fetchLessons();
                    }}
                />
            )}
        </div>
    );
}

export default function LessonsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-white min-h-screen">
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                type="button"
                className={`fixed top-4 left-4 z-50 inline-flex items-center p-2 sm:hidden bg-[#267CD1] text-white rounded-lg hover:bg-blue-600 transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
                    <LessonContent />
                </Suspense>
            </main>
        </div>
    )
}
