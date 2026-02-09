"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ArrowRight, Trash2 } from 'lucide-react';

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    gradeId: string;
    onSuccess?: () => void;
    initialData?: {
        id: number;
        title: string;
        subtext: string;
    } | null;
}

export default function CreateSubjectModal({ isOpen, onClose, gradeId, onSuccess, initialData }: CreateSubjectModalProps) {
    const [title, setTitle] = useState('');
    const [subtext, setSubtext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const supabase = createClient();

    // Populate fields when editing
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setSubtext(initialData.subtext);
        } else {
            setTitle('');
            setSubtext('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        if (!title || !subtext) {
            alert("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        
        if (initialData) {
            // Update existing subject
            const { error } = await supabase
                .from('subjects')
                .update({
                    title: title,
                    subtext: subtext
                })
                .eq('id', initialData.id);

            setIsLoading(false);

            if (error) {
                console.error('Error updating subject:', error);
                alert(`Failed to update subject: ${error.message}`);
            } else {
                onSuccess?.();
                onClose();
            }
        } else {
            // Insert new subject
            const { error } = await supabase
                .from('subjects')
                .insert([
                    {
                        grade_id: gradeId,
                        title: title,
                        subtext: subtext
                    }
                ]);

            setIsLoading(false);

            if (error) {
                console.error('Error creating subject:', error);
                alert(`Failed to create subject: ${error.message}`);
            } else {
                setTitle('');
                setSubtext('');
                onSuccess?.();
                onClose();
            }
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;
        
        if (!confirm("Are you sure you want to delete this subject? This will also delete all associated topics, lessons, and assessments.")) {
            return;
        }

        setIsDeleting(true);
        
        // Cascade delete (assumes DB has ON DELETE CASCADE configured)
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', initialData.id);

        setIsDeleting(false);

        if (error) {
            console.error('Error deleting subject:', error);
            alert(`Failed to delete subject: ${error.message}`);
        } else {
            onSuccess?.();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        
                        {initialData && (
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-white bg-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-black mb-6">
                        {initialData ? 'Edit Subject' : 'Create Subject'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-blue-100/50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Physics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subtext</label>
                            <input
                                type="text"
                                value={subtext}
                                onChange={(e) => setSubtext(e.target.value)}
                                className="w-full bg-blue-100/50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all pt-3"
                                placeholder="e.g. Introduction to Physics"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-4 flex gap-4 justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || isDeleting}
                        className="bg-[#267CD1] hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
