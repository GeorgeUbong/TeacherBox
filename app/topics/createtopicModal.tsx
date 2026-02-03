"use client"
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ArrowRight } from 'lucide-react';

interface CreateTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    onSuccess?: () => void;
}


export default function CreateTopicModal({ isOpen, onClose, subjectId, onSuccess }: CreateTopicModalProps) {
    const [title, setTitle] = useState('');
    const [subtopic, setSubtopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async () => {
        if (!title || !subtopic) {
            alert("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        const { error } = await supabase
            .from('topics')
            .insert([
                {
                    subject_id: subjectId,
                    title: title,
                    subtopic: subtopic
                }
            ]);

        setIsLoading(false);

        if (error) {
            console.error('Error creating topic:', error);
            alert(`Failed to create topic: ${error.message}`);
        } else {
            setTitle('');
            setSubtopic('');
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
                        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            New Topic
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-black mb-6">Create Topic</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Topic Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-blue-100/50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. Kinematics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Subtopic</label>
                            <input
                                type="text"
                                value={subtopic}
                                onChange={(e) => setSubtopic(e.target.value)}
                                className="w-full bg-blue-100/50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all pt-3"
                                placeholder="e.g. Motion in 1D"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-4 flex gap-4 justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
