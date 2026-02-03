'use client'

import { useEffect, useState } from 'react';
//import { createClient } from '@/src/lib/supabase/client';
//import { Tables } from '@/src/lib/supabase/supabase.types';
import { BarChart3, FileText } from 'lucide-react';

export default function LessonUp() {
 /*   const [lessonsCount, setLessonsCount] = useState(0);
    const [subjectBreakdown, setSubjectBreakdown] = useState<{ subject: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const supabase = createClient();
                const { data: lessons, error } = await supabase
                    .from('lessons')
                    .select('lesson_id, topic_id, topics(subject_id, subjects(subject_name))');

                if (error) throw error;

                setLessonsCount(lessons?.length || 0);

                // Count lessons by subject
                const breakdown: { [key: string]: number } = {};
                lessons?.forEach((lesson: any) => {
                    const subjectName = lesson.topics?.subjects?.subject_name || 'Unknown';
                    breakdown[subjectName] = (breakdown[subjectName] || 0) + 1;
                });

                setSubjectBreakdown(
                    Object.entries(breakdown).map(([subject, count]) => ({
                        subject,
                        count
                    }))
                );
            } catch (error) {
                console.error('Error fetching lessons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []); */

    return (
        <div className="bg-blue-500 text-white rounded-2xl p-8 shadow-lg ">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lessons Uploaded</h3>
                <FileText className="w-8 h-8 text-blue-100" />
            </div>

            <div className="relative flex items-center justify-center mb-8">
                <div className="text-5xl font-bold">{lessonsCount}</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <BarChart3 className="w-20 h-20 " />
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