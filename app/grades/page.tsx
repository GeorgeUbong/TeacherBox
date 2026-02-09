"use client"
import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '../components/SideBar';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Plus } from 'lucide-react';
import CreateSubjectModal from './CreateSubjectModal';
import SubjectCard from './component';


function GradeContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [gradeName, setGradeName] = useState<string>('');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchGradeAndSubjects = async () => {
        if (!id) return;
        setIsLoading(true);

        // Fetch Grade Name
        const { data: gradeData } = await supabase
            .from('grades')
            .select('name')
            .eq('id', id)
            .single();

        if (gradeData) {
            setGradeName(gradeData.name);
        }

        // Fetch Subjects
        const { data: subjectsData } = await supabase
            .from('subjects')
            .select('*')
            .eq('grade_id', id)
            .order('title', { ascending: true });

        if (subjectsData) {
            setSubjects(subjectsData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchGradeAndSubjects();
    }, [id]);

    const handleEdit = (subject: any) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-12 w-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-[#267CD1] mb-2">{gradeName}</h2>
                    <p className="text-[#267CD1] font-medium">Subjects</p>
                </div>

                <button
                    className="flex items-center gap-1 md:gap-2 bg-[#267CD1] 
               text-white px-4 py-1.5 md:px-6 md:py-2.5 
               text-sm md:text-base rounded-full 
               hover:bg-blue-700 transition-colors 
               font-medium shadow-sm hover:shadow-md"
                    onClick={handleAddNew}
                >
                    Upload New Subject
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
            </div>

           {isLoading ? (
  <div className="loader-wrapper">
    <div className="loader">
      <div className="jimu-primary-loading" />
    </div>
  </div>
) : subjects.length > 0 ? (
  /* Display the grid if subjects exist */
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {subjects.map((subject) => (
      <SubjectCard
        key={subject.id}
        id={subject.id}
        title={subject.title}
        description={subject.subtext}
        onEdit={() => handleEdit(subject)}
      />
    ))}
  </div>
) : (
  /* Empty State */
  <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
    <div className="bg-slate-700 p-4 rounded-full mb-4">
      <svg 
        className="w-8 h-8 text-slate-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-white">No subjects found</h3>
    <p className="text-slate-400 mt-2 max-w-sm">
      It looks like you haven't added any subjects yet. Start by creating your first one!
    </p>
    <button 
      onClick={handleAddNew}
      className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
    >
      Add New Subject
    </button>
  </div>
)}

            {id && (
                <CreateSubjectModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSubject(null);
                    }}
                    gradeId={id}
                    initialData={editingSubject}
                    onSuccess={() => {
                        fetchGradeAndSubjects();
                    }}
                />
            )}


        </div>
    );
}

export default function GradePage() {
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
                    <GradeContent />
                </Suspense>


            </main>
        </div>
    )
}
