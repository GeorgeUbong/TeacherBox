'use client';

import React, { useState, useEffect } from 'react';
import { Save, PlusSquare, CheckSquare, AlertCircle, X, Loader2 } from 'lucide-react';
import { Question as QuestionType } from '../page';

interface QuestionProps {
    onAddQuestion: (question: Omit<QuestionType, 'id'>) => void;
    currentCount: number;
    editingQuestion: QuestionType | null;
    onCancelEdit: () => void;
    onFinish: () => void;
    isSaving: boolean;
}

export default function Question({ 
    onAddQuestion, 
    currentCount, 
    editingQuestion, 
    onCancelEdit,
    onFinish,
    isSaving
}: QuestionProps) {
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState({
        A: '',
        B: '',
        C: '',
        D: ''
    });
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');

    // Load question into editor when editingQuestion changes
    useEffect(() => {
        if (editingQuestion) {
            setQuestionText(editingQuestion.text);
            const opts = { A: '', B: '', C: '', D: '' };
            editingQuestion.options.forEach(opt => {
                if (['A', 'B', 'C', 'D'].includes(opt.label)) {
                    opts[opt.label as keyof typeof opts] = opt.text;
                }
            });
            setOptions(opts);
            setAnswer(editingQuestion.answer);
            setError('');
        } else {
            // Reset if editingQuestion becomes null
            setQuestionText('');
            setOptions({ A: '', B: '', C: '', D: '' });
            setAnswer('');
        }
    }, [editingQuestion]);

    const handleOptionChange = (letter: string, value: string) => {
        setOptions(prev => ({ ...prev, [letter]: value }));
        if (error) setError('');
    };

    const handleSubmit = () => {
        // Validation
        if (!questionText.trim()) {
            setError('Please enter a question text.');
            return;
        }
        if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) {
            setError('Please fill in all options (A-D).');
            return;
        }
        if (!answer.trim()) {
            setError('Please provide the correct answer.');
            return;
        }

        // Create/Update question object
        onAddQuestion({
            text: questionText,
            options: [
                { label: 'A', text: options.A },
                { label: 'B', text: options.B },
                { label: 'C', text: options.C },
                { label: 'D', text: options.D },
            ],
            answer: answer
        });

        // Reset fields
        setQuestionText('');
        setOptions({ A: '', B: '', C: '', D: '' });
        setAnswer('');
        setError('');
    };

    return (
        <div className="bg-[#2D82D7] rounded-[2.5rem] p-10 shadow-xl text-white h-fit relative">
            {error && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-10 w-max">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold">{error}</span>
                </div>
            )}

            {editingQuestion && (
                <div className="absolute top-6 right-10 flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Editing Mode</span>
                    <button 
                        onClick={onCancelEdit}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                        title="Cancel editing"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="flex gap-4 mb-8">
                <span className="text-3xl font-bold mt-2">{currentCount}.</span>
                <div className="flex-1">
                    <textarea 
                        value={questionText}
                        onChange={(e) => {
                            setQuestionText(e.target.value);
                            if (error) setError('');
                        }}
                        className="w-full bg-[#5299E0] border-none rounded-sm p-8 text-white placeholder:text-blue-100/70 text-2xl font-bold min-h-[160px] focus:ring-0 outline-none resize-none flex items-center justify-center text-center"
                        placeholder="Add Question.."
                    />
                </div>
            </div>

            <div className="ml-12 space-y-6 mb-12">
                {['A', 'B', 'C', 'D'].map((letter) => (
                    <div key={letter} className="flex items-center gap-6">
                        <span className="text-2xl font-bold w-8">{letter}.</span>
                        <input 
                            type="text"
                            value={options[letter as keyof typeof options]}
                            onChange={(e) => handleOptionChange(letter, e.target.value)}
                            className="flex-1 bg-[#5299E0] border-none rounded-sm py-3 px-6 text-white placeholder:text-blue-100/70 text-lg font-bold focus:ring-0 outline-none"
                            placeholder="Add Option"
                        />
                    </div>
                ))}
                
                {/* Answer Field */}
                <div className="flex items-center gap-6">
                    <span className="text-xl font-bold w-20 shrink-0">Answer:</span>
                    <input 
                        type="text"
                        value={answer}
                        onChange={(e) => {
                            setAnswer(e.target.value);
                            if (error) setError('');
                        }}
                        className="flex-1 bg-[#5299E0] border-none rounded-sm py-3 px-6 text-white placeholder:text-blue-100/70 text-lg font-bold focus:ring-0 outline-none"
                        placeholder="Place Correct Answer Here"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mt-16">
                <button 
                    onClick={onFinish}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-[#FF4D4D] px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <CheckSquare className="w-6 h-6" />
                    )}
                    {isSaving ? 'Saving...' : 'Finish'}
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-[#2D82D7] px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusSquare className="w-6 h-6" />
                    {editingQuestion ? 'Update Question' : 'New Question'}
                </button>
            </div>
        </div>
    );
}
