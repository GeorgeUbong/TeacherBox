"use client"
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, FileText } from 'lucide-react';

// Props interface
interface LessonCardProps {
    id: number;
    title: string;
    content?: string;
    type?: 'video' | 'pdf' | 'other'; // Optional type to show icon
    onEdit?: () => void;
}

export default function LessonCard({ id, title, content, type = 'video', onEdit }: LessonCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 relative hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                {/* Icon Placeholder */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'video' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                    {type === 'video' ? <Play className="w-5 h-5 ml-1" /> : <FileText className="w-6 h-6" />}
                </div>

                {/* Edit Badge */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit?.();
                    }}
                    className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                    Edit
                </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {content ? (content.length > 12 ? `${content.slice(0, 12)}...` : content) : "No content available."}
            </p>

            <Link
                href={`/lessonview?id=${id}`}
                className="flex items-center text-[#267CD1] font-bold text-sm hover:text-blue-700 group"
            >
                View Lesson
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
