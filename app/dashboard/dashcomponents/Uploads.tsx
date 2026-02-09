'use client'

import React, { useEffect, useState } from 'react';
import { BarChart3, FileText, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LessonUp({ totalLessons }: { totalLessons: number }) {
    const [recentLessons, setRecentLessons] = useState<any[]>([]);
    const [totalUploads, setTotalUploads] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Total Count
                const { count, error: countError } = await supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true });
                
                if (countError) throw countError;
                setTotalUploads(count);

                // 2. Fetch Recent 3
                const { data: recentData, error: recentError } = await supabase
                    .from('lessons')
                    .select(`
                        title,
                        topics (
                            subjects (
                                title
                            )
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (recentError) throw recentError;
                if (recentData) {
                    setRecentLessons(recentData.map((item: any) => ({
                        title: item.title,
                        subject: item.topics?.subjects?.title || 'N/A'
                    })));
                }
            } catch (err) {
                console.error('Error fetching lesson data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-[#2B7FFF] text-white rounded-2xl shadow-lg 
  p-6 md:p-10 
  min-h-[300px] md:h-full 
  flex flex-col justify-between
  w-full max-w-sm md:max-w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Lessons Uploaded</h3>
                <FileText className="w-8 h-8 text-blue-100" />
            </div>

            <div className="relative flex items-center justify-center mb-10 flex-shrink-0">
                <div className="text-6xl font-extrabold z-10">
                    {totalUploads === null ? '...' : totalUploads}
                </div>
                <div className="absolute flex items-center justify-center opacity-10">
                    <BarChart3 className="w-24 h-24" />
                </div>
            </div>

            <div className="mt-auto">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-100 mb-3 opacity-80">Recent Additions</h4>
                {loading ? (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                    </div>
                ) : recentLessons.length > 0 ? (
                    <div className="space-y-3">
                        {recentLessons.map((item, idx) => (
                            <div key={idx} className="flex flex-col border-l-2 border-blue-300/30 pl-3">
                                <span className="text-[10px] font-bold text-blue-200 uppercase">{item.subject}</span>
                                <span className="text-sm font-semibold truncate leading-tight text-white">{item.title}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-blue-200 italic">No lessons uploaded yet.</p>
                )}
            </div>
        </div>
    );
}