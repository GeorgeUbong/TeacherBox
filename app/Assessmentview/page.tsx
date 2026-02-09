'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from "../components/SideBar";
import QuestionView from "./assessment components/QuestionView";
import QuestionComponent from "./assessment components/Question";
import { Trash2, ChevronRight, Loader2, ClipboardList } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export interface Question {
    id: number;
    text: string;
    options: {
        label: string;
        text: string;
    }[];
    answer: string;
}

function AssessmentViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lessonId = searchParams.get('id');
    const [hierarchy, setHierarchy] = useState<{ grade: string, subject: string, topic: string, lesson: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [existingAssessmentId, setExistingAssessmentId] = useState<number | null>(null);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [existingData, setExistingData] = useState<any>(null);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchHierarchy = async () => {
            if (!lessonId) return;

            const { data: lessonData } = await supabase
                .from('lessons')
                .select('title, topic_id')
                .eq('id', lessonId)
                .single();

            if (lessonData) {
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
                            topic: topicData.title,
                            lesson: lessonData.title
                        });
                    }
                }
            }
        };

        const checkExistingAssessment = async () => {
            if (!lessonId) return;

            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('lesson_id', lessonId)
                .maybeSingle();

            if (data) {
                setExistingData(data);
                setShowConflictModal(true);
            }
        };

        const loadPageData = async () => {
            setIsLoading(true);
            await fetchHierarchy();
            await checkExistingAssessment();
            setIsLoading(false);
        };

        loadPageData();
    }, [lessonId]);

    const handleAddQuestion = (qData: Omit<Question, 'id'>) => {
        if (editingQuestion) {
            setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...qData, id: q.id } : q));
            setEditingQuestion(null);
        } else {
            const questionWithId = {
                ...qData,
                id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1
            };
            setQuestions([...questions, questionWithId]);
        }
    };

    const handleEditRequest = (q: Question) => {
        setEditingQuestion(q);
        const editorElement = document.querySelector('.question-editor');
        if (editorElement) {
            window.scrollTo({ top: editorElement.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
        }
    };

    const handleEditExisting = () => {
        if (!existingData) return;
        
        setAssessmentTitle(existingData.title);
        setExistingAssessmentId(existingData.id);
        
        if (existingData.quiz_data && existingData.quiz_data.questions) {
            const loadedQuestions: Question[] = existingData.quiz_data.questions.map((q: any, idx: number) => {
                const correctOption = q.options.find((opt: any) => opt.is_correct);
                return {
                    id: idx + 1,
                    text: q.question_text,
                    options: q.options.map((opt: any) => ({
                        label: opt.id.toUpperCase(),
                        text: opt.text
                    })),
                    answer: correctOption ? correctOption.text : ''
                };
            });
            setQuestions(loadedQuestions);
        }
        setShowConflictModal(false);
    };

    const handleReplaceExisting = () => {
        setExistingAssessmentId(null);
        setShowConflictModal(false);
    };

    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard this assessment? All unsaved changes will be lost.')) {
            if (lessonId) {
                router.push(`/lessonview?id=${lessonId}`);
            } else {
                router.push('/dashboard');
            }
        }
    };

    const handleFinish = async () => {
        if (!assessmentTitle.trim()) {
            alert('Please add an assessment title before finishing.');
            return;
        }
        if (questions.length === 0) {
            alert('Please add at least one question.');
            return;
        }

        setIsSaving(true);

        const quizData = {
            questions: questions.map((q, idx) => ({
                id: `q${idx + 1}`,
                question_text: q.text,
                options: q.options.map((opt, optIdx) => ({
                    id: opt.label.toLowerCase(),
                    text: opt.text,
                    is_correct: opt.text.trim().toLowerCase() === q.answer.trim().toLowerCase() || opt.label.toUpperCase() === q.answer.trim().toUpperCase()
                }))
            }))
        };

        try {
            if (existingAssessmentId) {
                const { error } = await supabase
                    .from('assessments')
                    .update({
                        title: assessmentTitle,
                        quiz_data: quizData
                    })
                    .eq('id', existingAssessmentId);

                if (error) throw error;
            } else {
                await supabase
                    .from('assessments')
                    .delete()
                    .eq('lesson_id', lessonId);

                const { error } = await supabase
                    .from('assessments')
                    .insert([
                        {
                            lesson_id: lessonId,
                            title: assessmentTitle,
                            quiz_data: quizData
                        }
                    ]);

                if (error) throw error;
            }

            alert('Assessment saved successfully!');
            router.push(`/lessonview?id=${lessonId}`);
        } catch (error: any) {
            console.error('Error saving assessment:', error);
            alert(`Failed to save assessment: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loader-wrapper">
                <div className="loader">
                    <div className="jimu-primary-loading" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">{hierarchy?.grade || 'Assessment'}</h1>
                    <div className="flex items-center text-[#267CD1] font-semibold text-xl">
                        <span>{hierarchy?.subject || 'Subjects'}</span>
                        <span className="mx-1">/</span>
                        <span>{hierarchy?.topic || 'Topics'}</span>
                        <span className="mx-1">/</span>
                        <span>{hierarchy?.lesson || 'Lesson 1'}</span>
                        <span className="mx-1">/</span>
                        <span>Assessment</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleDiscard}
                        className="flex items-center gap-2 bg-[#FF0000] text-white px-5 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm text-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                        Discard
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-[#1E293B] mb-6">{hierarchy?.lesson} Assessment Preview</h2>

            <div className="mb-10 w-full max-w-md">
                <input 
                    type="text"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    placeholder="Add Assessment Title"
                    className="bg-[#A0C4EF] text-white placeholder:text-blue-50 font-bold px-10 py-3 rounded-md w-full cursor-pointer focus:bg-blue-300 transition-colors text-xl outline-none"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <QuestionView questions={questions} onEdit={handleEditRequest} />
                <div className="question-editor">
                    <QuestionComponent 
                        onAddQuestion={handleAddQuestion} 
                        currentCount={editingQuestion ? editingQuestion.id : (questions.length + 1)} 
                        editingQuestion={editingQuestion}
                        onCancelEdit={() => setEditingQuestion(null)}
                        onFinish={handleFinish}
                        isSaving={isSaving}
                    />
                </div>
            </div>

            {showConflictModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                                Existing Assessment Found
                            </h2>
                            <p className="text-gray-600 text-center mb-8 leading-relaxed">
                                An assessment already exists for this lesson. Would you like to edit the existing one or create a completely new one?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleEditExisting}
                                    className="w-full bg-[#267CD1] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    Edit Previous Assessment
                                </button>
                                <button
                                    onClick={handleReplaceExisting}
                                    className="w-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Replace with New
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AssessmentPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen">
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

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform sm:sticky sm:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <Sidebar hideMobileButton isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            <main className="flex-1 p-6 md:p-10">
                <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading Assessment Page...</div>}>
                    <AssessmentViewContent />
                </Suspense>
            </main>
        </div>
    );
}