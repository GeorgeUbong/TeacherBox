"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '../components/SideBar'
import { Plus, X } from 'lucide-react'

interface Grade {
    id: string
    name: string
    order_index: number
}

export default function GradePage() {
    const [grades, setGrades] = useState<Grade[]>([])
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newGradeName, setNewGradeName] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchGrades = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .order('order_index', { ascending: true })

        if (error) {
            console.error('Error fetching grades:', error)
            setError('Failed to fetch grades')
        } else {
            setGrades(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchGrades()
    }, [])

    const handleCreateGrade = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGradeName.trim()) return

        // Get the current highest order_index to append the new grade
        const maxOrderIndex = grades.length > 0
            ? Math.max(...grades.map(g => g.order_index || 0))
            : 0

        const { data, error } = await supabase
            .from('grades')
            .insert([
                { name: newGradeName, order_index: maxOrderIndex + 1 }
            ])
            .select()

        if (error) {
            console.error('Error creating grade:', error)
            alert('Failed to create grade')
        } else {
            if (data) {
                setGrades([...grades, data[0]])
            }
            setNewGradeName('')
            setIsModalOpen(false)
            // Optional: refresh list to be safe or just rely on local update
            fetchGrades()
        }
    }

    return (
        <div className="flex bg-white min-h-screen text-black">
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                type="button"
                className={`fixed top-4 left-4 z-50 inline-flex items-center p-2 sm:hidden bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform sm:sticky sm:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar hideMobileButton isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            <main className="flex-1 p-6 md:p-12 mt-10 sm:mt-0">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Grades</h2>
                        <p className="text-gray-600">Manage your grades here</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Create Grade
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading grades...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Order</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                            No grades found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    grades.map((grade) => (
                                        <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">{grade.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{grade.order_index}</td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Placeholder for future actions like edit/delete */}
                                                <button className="text-gray-400 hover:text-blue-500">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Create Grade Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-800">Create New Grade</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGrade} className="p-6">
                            <div className="mb-6">
                                <label htmlFor="gradeName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Grade Name
                                </label>
                                <input
                                    type="text"
                                    id="gradeName"
                                    value={newGradeName}
                                    onChange={(e) => setNewGradeName(e.target.value)}
                                    placeholder="e.g. Primary 1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newGradeName.trim()}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
