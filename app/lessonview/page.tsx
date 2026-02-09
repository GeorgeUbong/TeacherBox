"use client"
import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '../components/SideBar';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Edit2, Plus, BookOpen, ExternalLink, Play, FileText } from 'lucide-react';
import CreateLessonModal from '../lessons/createlessonModal';
import Link from 'next/link';
import Image from 'next/image';
import holder from '../assets/childs.png'

function LessonViewContent() {
    const searchParams = useSearchParams();
    const lessonId = searchParams.get('id');
    const [lesson, setLesson] = useState<any>(null);
    const [hierarchy, setHierarchy] = useState<{ grade: string, subject: string, topic: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const supabase = createClient();

    const fetchLessonData = async () => {
        if (!lessonId) return;
        setIsLoading(true);

        // Fetch Lesson
        const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (lessonError || !lessonData) {
            console.error('Error fetching lesson:', lessonError);
            setIsLoading(false);
            return;
        }

        setLesson(lessonData);

        // Fetch Hierarchy (Topic -> Subject -> Grade)
        const { data: topicData } = await supabase
            .from('topics')
            .select('title, subject_id')
            .eq('id', lessonData.topic_id)
            .single();

        if (topicData) {
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
                    subject: subjectData.title,
                    topic: topicData.title
                });
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLessonData();
    }, [lessonId]);

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500 font-medium">Loading lesson details...</div>;
    }

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <BookOpen className="w-12 h-12 text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson not found</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    The requested lesson could not be found or you don't have access to it.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 w-full max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[#267CD1] mb-2">{hierarchy?.grade || 'Lesson Detail'}</h1>
                <p className="text-[#267CD1] font-medium text-lg">
                    {hierarchy?.subject} / {hierarchy?.topic} / {lesson.title}
                </p>
                <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 bg-[#267CD1] text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                        <Link href={`/Assessmentview?id=${lessonId}`}>
                        <button className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium shadow-sm">
                            <Plus className="w-4 h-4" />
                            Add Assessment
                        </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lesson Materials Section */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-[#267CD1] mb-6 underline decoration-2 underline-offset-8">Lesson Materials</h3>

                <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-lg group">
                    {/* Placeholder image resembling the user's provided UI */}
                    <Image
                        src={holder}
                        alt="Lesson Material Placeholder"
                        className="w-full h-[400px] object-cover opacity-80"
                    />

                    {/* Media Type Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl  flex flex-col items-center gap-4 border border-white/20">
                            {lesson.media_type === 'video' ? (
                                <Play className="w-16 h-16 text-[#267CD1]" fill="currentColor" />
                            ) : (
                                <FileText className="w-16 h-16 text-[#267CD1]" />
                            )}
                            <div className="text-center">
                                <p className="text-gray-900 font-bold text-xl">{lesson.media_type === 'video' ? 'Video Lesson' : 'Document Lesson'}</p>
                                <p className="text-gray-500 text-sm mt-1">Click to view content</p>
                            </div>
                            <a
                                href={lesson.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-[#267CD1] font-semibold hover:underline flex items-center gap-1"
                            >
                                View Material <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/**<div className="text-center mt-4">
                    <a
                        href={lesson.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 font-medium hover:underline text-lg decoration-blue-300 underline-offset-4"
                    >
                        View {lesson.media_type === 'video' ? 'Video' : 'Document'}
                    </a>
                </div> */}
            </div>

            {/* Lesson Notes Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100  mb-12">
                <h3 className="text-xl font-bold text-blue-600 mb-8 underline decoration-2 underline-offset-8">Lesson Notes</h3>

                <div className="prose prose-blue max-w-none">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">{lesson.content ? lesson.title : ''}</h4>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                        {lesson.content || 'No notes available for this lesson.'}
                    </div>
                </div>
            </div>

            {/* Edit Modal (Placeholder - will need to pass initial data to CreateLessonModal) */}
            {lesson && (
                <CreateLessonModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    topicId={lesson.topic_id}
                    onSuccess={() => {
                        fetchLessonData();
                        setIsEditModalOpen(false);
                    }}
                    // We'll need to update CreateLessonModal to handle these:
                    initialData={lesson}
                />
            )}
        </div>
    );
}

export default function LessonViewPage() {
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
                    <LessonViewContent />
                </Suspense>
            </main>
        </div>
    )
}
