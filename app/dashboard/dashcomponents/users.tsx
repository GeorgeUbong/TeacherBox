'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Users as UsersIcon, Upload, CheckCircle, ClipboardList } from 'lucide-react';

interface MetricCard {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

export default function Users() {
    const [metrics, setMetrics] = useState<MetricCard[]>([
        { title: 'Active Users', value: 0, icon: <UsersIcon className="w-6 h-6" />, color: 'bg-blue-500' },
        { title: 'Assessments Completed', value: 0, icon: <CheckCircle className="w-6 h-6" />, color: 'bg-blue-600' },
        { title: 'Assessments Created', value: 0, icon: <ClipboardList className="w-6 h-6" />, color: 'bg-blue-700' },
        { title: 'Uploads in the last 24h', value: 0, icon: <Upload className="w-6 h-6" />, color: 'bg-blue-800' },
    ]);
   /* const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const supabase = createClient();

                // Fetch assessments count
                const { data: assessments, error: assessError } = await supabase
                    .from('assessments')
                    .select('assessment_id', { count: 'exact' });

                if (assessError) throw assessError;

                // Fetch lessons count (uploaded in last 24h)
                const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const { data: recentLessons, error: lessonsError } = await supabase
                    .from('lessons')
                    .select('lesson_id', { count: 'exact' })
                    .gte('created_at', last24h);

                if (lessonsError) throw lessonsError;

                setMetrics(prev => [
                    { ...prev[0], value: 140 }, // Active users (placeholder - requires auth table)
                    { ...prev[1], value: 10 }, // Assessments completed (placeholder)
                    { ...prev[2], value: assessments?.length || 0 },
                    { ...prev[3], value: recentLessons?.length || 0 },
                ]);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);
*/
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, idx) => (
                <div key={idx} className={`${metric.color} text-white rounded-xl p-6 shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">{metric.title}</h3>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            {metric.icon}
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold">{metric.value}</h2>
                </div>
            ))}
        </div>
    );
}