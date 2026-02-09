"use client"
import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ArrowRight, Upload, File, FileVideo, Trash, Trash2 } from 'lucide-react';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string;
    onSuccess?: () => void;
    initialData?: any;
}

export default function CreateLessonModal({ isOpen, onClose, topicId, onSuccess, initialData }: CreateLessonModalProps) {
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Populate state when modal opens
    useEffect(() => {
        if (initialData && isOpen) {
            setTitle(initialData.title);
            setNote(initialData.content);
            setFile(null); // Clear file selection when editing
        } else if (isOpen) {
            setTitle('');
            setNote('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const MAX_SIZE = 20 * 1024 * 1024; // 20MB

            if (selectedFile.size > MAX_SIZE) {
                alert("File size exceeds 20MB limit.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            const validExtensions = /(\.mp4|\.pdf)$/i;
            if (!validExtensions.test(selectedFile.name)) {
                alert("Invalid file format. Please upload .mp4 or .pdf files only.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!title || !note || (!file && !initialData)) {
            alert("Please fill in all fields and select a file.");
            return;
        }

        setIsLoading(true);

        try {
            let mediaUrl = initialData?.media_url;
            let mediaType = initialData?.media_type;

            // 1. Upload file if a new one is selected
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${topicId}/${fileName}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('curriculum')
                    .upload(filePath, file);

                if (uploadError) {
                    throw new Error(`Storage Upload failed: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('curriculum')
                    .getPublicUrl(filePath);

                mediaUrl = publicUrl;
                mediaType = fileExt?.toLowerCase() === 'mp4' ? 'video' : 'pdf';
            }

            const lessonPayload = {
                topic_id: topicId,
                title: title,
                content: note,
                media_url: mediaUrl,
                media_type: mediaType
            };

            if (initialData?.id) {
                const { error: updateError } = await supabase
                    .from('lessons')
                    .update(lessonPayload)
                    .eq('id', initialData.id);

                if (updateError) throw new Error(`Database update failed: ${updateError.message}`);
            } else {
                const { error: insertError } = await supabase
                    .from('lessons')
                    .insert([lessonPayload]);

                if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);
            }

            onSuccess?.();
            onClose();

        } catch (error: any) {
            console.error('Error saving lesson:', error);
            alert(`Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;
        
        if (!confirm("Are you sure you want to delete this lesson? This will also delete any associated assessments.")) {
            return;
        }

        setIsDeleting(true);
        
        try {
            // Delete lesson from DB (Cascade handles related records)
            const { error: deleteError } = await supabase
                .from('lessons')
                .delete()
                .eq('id', initialData.id);

            if (deleteError) throw deleteError;

            // Note: We're not deleting the actual file from storage here to keep it simple, 
            // but in a production app you'd typically want to delete the file too using supabase.storage.from().remove()

            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Error deleting lesson:', error);
            alert(`Failed to delete lesson: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 pb-2 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        {/*<div className="bg-[#267CD1] text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            {initialData ? 'Edit Lesson' : 'New Lesson'}
                            <ArrowRight className="w-3 h-3" />
                        </div>*/}
                        {initialData && (
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500 text-white hover:bg-red-50 p-2 
                                rounded-full transition-colors flex items-center
                                 gap-1 text-xs font-bold"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-black">
                        {initialData ? 'Edit Lesson' : 'Create Lesson'}
                    </h2>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-blue-50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. Introduction to Kinetics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {initialData ? 'Update Lesson Material (Optional)' : 'Lesson Material (MP4 or PDF, max 20MB)'}
                        </label>
                        <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 flex flex-col items-center justify-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".mp4,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {!file ? (
                                <>
                                    <div className="bg-blue-100 p-3 rounded-full mb-3 text-[#267CD1]">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Click to upload {initialData ? 'new' : ''} file</p>
                                    <p className="text-xs text-gray-400 mt-1">.mp4 or .pdf (Max 20MB)</p>
                                    {initialData && (
                                        <p className="text-xs text-blue-500 mt-2 font-medium italic">Current file will be kept if none selected</p>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-3 w-full p-2">
                                    <div className="bg-blue-100 p-2 rounded text-blue-600 shrink-0">
                                        {file.name.endsWith('.pdf') ? <File className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Notes</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full bg-blue-50 border-none rounded-lg px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Type or paste lesson notes here..."
                        />
                    </div>
                </div>

                <div className="p-6 pt-2 flex gap-4 justify-center border-t border-gray-100 mt-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || isDeleting}
                        className="bg-[#267CD1] hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
                    >
                        {isLoading ? 'Saving...' : 'Save Lesson'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading || isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors shadow-sm w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
