'use client'

import { Users as UsersIcon, Upload, CheckCircle, ClipboardList } from 'lucide-react'

interface MetricCard {
    title: string
    value: number | string // allow string if you later want "140+" etc.
    icon: React.ReactNode
    color: string
}

const metrics: MetricCard[] = [
    {
        title: 'Active Users',
        value: 140,
        icon: <UsersIcon className="w-6 h-6" />,
        color: 'bg-blue-500',
    },
    {
        title: 'Assessments Completed',
        value: 10,
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'bg-blue-600',
    },
    {
        title: 'Assessments Created',
        value: 12,
        icon: <ClipboardList className="w-6 h-6" />,
        color: 'bg-blue-700',
    },
    {
        title: 'Uploads in the last 24h',
        value: 10,
        icon: <Upload className="w-6 h-6" />,
        color: 'bg-blue-800',
    },
]

export default function DashboardMetrics() {
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
                    <h2 className="text-4xl font-bold">{metric.value}</h2>
                </div>
            ))}
        </div>
    )
}