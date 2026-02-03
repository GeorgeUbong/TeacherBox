"use client"
import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

// Props interface
interface TopicCardProps {
    id: number;
    title: string;
    subtopic?: string;
    onEdit?: () => void;
}

export default function TopicCard({ id, title, subtopic, onEdit }: TopicCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                {/* Icon Placeholder */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <BookOpen className="w-6 h-6" />
                </div>

                {/* Edit Badge */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit?.();
                    }}
                    className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                >
                    Edit Topic
                </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {subtopic || "No subtopic description available."}
            </p>

            <Link
                href={`/lessons?topicId=${id}`}
                className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700 group"
            >
                View Content
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
