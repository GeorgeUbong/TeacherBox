'use client'

import { BarChart3, FileText } from 'lucide-react';

export default function LessonUp() {
    const lessonsCount = 34;
    const subjectBreakdown = [
        { subject: 'Mathematics', count: 16 },
        { subject: 'English Literature', count: 8 },
        { subject: 'Basic Science', count: 10 },
    ];

    return (
        <div className="bg-blue-500 text-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lessons Uploaded</h3>
                <FileText className="w-8 h-8 text-blue-100" />
            </div>

            <div className="relative flex items-center justify-center mb-8">
                <div className="text-5xl font-bold">{lessonsCount}</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <BarChart3 className="w-20 h-20" />
                </div>
            </div>

            {subjectBreakdown.length > 0 && (
                <div className="space-y-2">
                    {subjectBreakdown.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span>{item.subject}</span>
                            <span className="font-semibold">{Math.round((item.count / lessonsCount) * 100)}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}