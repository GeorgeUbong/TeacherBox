'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FileText, Video, Loader2 } from 'lucide-react';

interface RecentUpload {
    title: string;
    media_type: string;
    created_at: string;
    grade: string;
    subject: string;
}

export default function RecentUploads() {
    const [uploads, setUploads] = useState<RecentUpload[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRecentUploads = async () => {
            try {
                const { data, error } = await supabase
                    .from('lessons')
                    .select(`
                        title,
                        media_type,
                        created_at,
                        topics (
                            subjects (
                                title,
                                grades (
                                    name
                                )
                            )
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;

                if (data) {
                    const formattedData = data.map((item: any) => ({
                        title: item.title,
                        media_type: item.media_type,
                        created_at: new Date(item.created_at).toLocaleDateString(),
                        grade: item.topics?.subjects?.grades?.name || 'N/A',
                        subject: item.topics?.subjects?.title || 'N/A'
                    }));
                    setUploads(formattedData);
                }
            } catch (error) {
                console.error('Error fetching recent uploads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentUploads();
    }, []);

    if (loading) {
        return (
            <div className="bg-blue-500 text-white rounded-2xl p-6 shadow-lg flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#6192D0] text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-50">Recent Uploads</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-400/50 text-blue-100 uppercase text-[10px] tracking-wider font-bold">
                            <th className="text-left py-3 px-4">Grade</th>
                            <th className="text-left py-3 px-4">Subject</th>
                            <th className="text-left py-3 px-4">Lesson Title</th>
                            <th className="text-left py-3 px-4">Media</th>
                            <th className="text-left py-3 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-400/30">
                        {uploads.length > 0 ? (
                            uploads.map((upload, idx) => (
                                <tr key={idx} className="hover:bg-blue-600/50 transition-colors group">
                                    <td className="py-4 px-4 font-medium">{upload.grade}</td>
                                    <td className="py-4 px-4 text-blue-50">{upload.subject}</td>
                                    <td className="py-4 px-4 font-semibold">{upload.title}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            {upload.media_type?.toLowerCase().includes('video') ? (
                                                <Video className="w-4 h-4 text-blue-200" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-blue-200" />
                                            )}
                                            <span className="capitalize">{upload.media_type}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-blue-100 text-xs">{upload.created_at}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-blue-200 italic">
                                    No recent uploads found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
