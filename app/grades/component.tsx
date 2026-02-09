"use client"
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Atom } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { Suspense } from "react";

// Props interface
interface SubjectCardProps {
    id: number;
    title: string;
    description?: string; // "Builds problem-solving skills..."
    icon?: React.ReactNode;
    onEdit?: () => void;
}



export default function SubjectCard({ id, title, description, icon, onEdit }: SubjectCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 relative hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                {/* Icon Placeholder - matching the reddish circle style */}
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                    {icon || <Atom className="w-6 h-6" />}
                </div>

                {/* Edit Badge */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit?.();
                    }}
                    className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                >
                    Edit Subject
                </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {description || "Builds problem-solving skills using numbers, formulas, and logical thinking."}
            </p>

            <Link
                href={`/topics?subjectId=${id}`}
                className="flex items-center text-[#267CD1] font-bold text-sm hover:text-blue-700 group"
            >
                View Lessons
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>


        </div>
    );
}
