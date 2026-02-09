'use client';

import React from 'react';
import { Edit2 } from 'lucide-react';
import { Question } from '../page';

interface QuestionViewProps {
    questions: Question[];
    onEdit: (q: Question) => void;
}

export default function QuestionView({ questions, onEdit }: QuestionViewProps) {
    if (questions.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 shadow-sm text-center">
                <p className="text-gray-500 font-medium">No questions added yet. Start by adding one on the right!</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-y-auto max-h-[750px] custom-scrollbar">
            <div className="space-y-8">
                {questions.map((q) => (
                    <div key={q.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex gap-2 mb-4">
                            <span className="font-bold text-gray-800 shrink-0">{q.id}.</span>
                            <p className="text-gray-800 font-medium leading-relaxed">
                                {q.text}
                            </p>
                        </div>
                        <div className="ml-6 space-y-2">
                            {q.options.map((opt) => (
                                <div key={opt.label} className="flex gap-2 text-sm text-gray-700">
                                    <span className="font-bold shrink-0">{opt.label}.</span>
                                    <span>{opt.text}</span>
                                </div>
                            ))}
                            <div className="flex gap-2 text-sm text-green-600 font-bold mt-2 bg-green-50 w-fit px-3 py-1 rounded-md">
                                <span className="shrink-0">Answer:</span>
                                <span>{q.answer}</span>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={() => onEdit(q)}
                                className="flex items-center gap-1.5 bg-[#3B82F6] text-white px-5 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}