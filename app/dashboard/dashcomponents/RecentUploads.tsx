"use client"

import React from 'react'

interface RecentUpload {
    grade: string
    subject: string
    media: string
    count: number
}

export default function RecentUploads() {
    const uploads: RecentUpload[] = [
        { grade: 'Primary 3', subject: 'Mathematics', media: 'Video', count: 23 },
        { grade: 'Primary 2', subject: 'Social studies', media: 'PDF', count: 23 },
        { grade: 'Primary 5', subject: 'Mathematics', media: 'PDF', count: 23 },
        { grade: 'Primary 4', subject: 'Basic Science', media: 'Video', count: 23 },
        { grade: 'Primary 1', subject: 'Mathematics', media: 'PDF', count: 23 },
    ]

    return (
        <div className="bg-blue-500 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-blue-400">
                            <th className="text-left py-2 px-2">Grade</th>
                            <th className="text-left py-2 px-2">Subject</th>
                            <th className="text-left py-2 px-2">Media Uploaded</th>
                            <th className="text-left py-2 px-2">Total Content</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploads.map((upload, idx) => (
                            <tr key={idx} className="border-b border-blue-400 hover:bg-blue-600 transition">
                                <td className="py-3 px-2">{upload.grade}</td>
                                <td className="py-3 px-2">{upload.subject}</td>
                                <td className="py-3 px-2">{upload.media}</td>
                                <td className="py-3 px-2">{upload.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
