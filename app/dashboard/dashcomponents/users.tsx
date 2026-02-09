'use client'

import React, { useEffect, useState } from 'react'
import { Users as UsersIcon, Upload, CheckCircle, ClipboardList } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface DashboardMetricsProps {
    assessmentsCreated: number;
    uploads24h: number;
    activeUsers: number;
}

export default function DashboardMetrics({ assessmentsCreated: initialAssessments, uploads24h: initialUploads, activeUsers: initialUsers }: DashboardMetricsProps) {
    const [counts, setCounts] = useState({
        assessments: initialAssessments || 0,
        uploads24h: initialUploads || 0,
        activeUsers: initialUsers || 0,
        completed: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // 1. Fetch Total Assessments
                const { count: assessmentCount, error: aError } = await supabase
                    .from('assessments')
                    .select('*', { count: 'exact', head: true });

                // 2. Fetch Uploads in last 24h
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const { count: uploadCount, error: uError } = await supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .gt('created_at', oneDayAgo);

                // 3. Simple hack for "Completed" or other stats if needed
                // For now we'll just use the assessmentCount for created
                
                setCounts({
                    assessments: assessmentCount || 0,
                    uploads24h: uploadCount || 0,
                    activeUsers: initialUsers || 0, // Keep this from RPC or props if no users table
                    completed: 10 // Placeholder as before
                });
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [initialUsers]);

    const metrics = [
        {
            title: 'Active Users',
            value: counts.activeUsers,
            icon: <UsersIcon className="w-6 h-6" />,
            color: 'bg-blue-500',
        },
        {
            title: 'Assessments Completed',
            value: counts.completed,
            icon: <CheckCircle className="w-6 h-6" />,
            color: 'bg-blue-600',
        },
        {
            title: 'Assessments Created',
            value: counts.assessments,
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'bg-blue-700',
        },
        {
            title: 'Uploads in the last 24h',
            value: counts.uploads24h,
            icon: <Upload className="w-6 h-6" />,
            color: 'bg-blue-800',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className={`${metric.color} text-white rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold opacity-90">{metric.title}</h3>
                        <div className="bg-white/20 rounded-full p-3">
                            {metric.icon}
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold">
                        {loading && counts.assessments === 0 ? '...' : metric.value}
                    </h2>
                </div>
            ))}
        </div>
    )
}
