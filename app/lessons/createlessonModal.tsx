"use client"
import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, ArrowRight, Upload, File, FileVideo, Trash } from 'lucide-react';

interface CreateLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string;
    onSuccess?: () => void;
    initialData?: any;
}

export default function CreateLessonModal({ isOpen, onClose, topicId, onSuccess, initialData }: CreateLessonModalProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [note, setNote] = useState(initialData?.content || '');
    const [file, setFile] = useState<File | null>(null);

    // Update state when initialData changes (for when modal is opened for different lessons)
    useEffect(() => {
        if (initialData && isOpen) {
            setTitle(initialData.title);
            setNote(initialData.content);
        } else if (isOpen) {
            setTitle('');
            setNote('');
            setFile(null);
        }
    }, [initialData, isOpen]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes

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

                console.log('Attempting upload to curriculum bucket:', filePath);
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('curriculum')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Storage Upload Error:', uploadError);
                    throw new Error(`Storage Upload failed: ${uploadError.message}`);
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('curriculum')
                    .getPublicUrl(filePath);

                mediaUrl = publicUrl;
                mediaType = fileExt?.toLowerCase() === 'mp4' ? 'video' : 'pdf';
                console.log('File uploaded, public URL:', mediaUrl);
            }

            // 2. Insert or Update record in database
            const lessonPayload = {
                topic_id: topicId,
                title: title,
                content: note,
                media_url: mediaUrl,
                media_type: mediaType
            };

            if (initialData?.id) {
                console.log('Attempting DB update for lesson:', initialData.id);
                const { error: updateError } = await supabase
                    .from('lessons')
                    .update(lessonPayload)
                    .eq('id', initialData.id);

                if (updateError) {
                    console.error('Database Update Error:', updateError);
                    throw new Error(`Database update failed: ${updateError.message}`);
                }
            } else {
                console.log('Attempting DB insert for lesson:', title);
                const { error: insertError } = await supabase
                    .from('lessons')
                    .insert([lessonPayload]);

                if (insertError) {
                    console.error('Database Insert Error:', insertError);
                    throw new Error(`Database insert failed: ${insertError.message}`);
                }
            }

            // Success
            if (!initialData) {
                setTitle('');
                setNote('');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 pb-2 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            New Lesson
                            <ArrowRight className="w-3 h-3" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-black">Create Lesson</h2>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Title */}
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

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Material (MP4 or PDF, max 20MB)</label>
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
                                    <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Click to upload file</p>
                                    <p className="text-xs text-gray-400 mt-1">.mp4 or .pdf (Max 20MB)</p>
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

                    {/* Lesson Note */}
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
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
                    >
                        {isLoading ? 'Uploading...' : 'Save Lesson'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 py-2.5 rounded-full transition-colors shadow-sm w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
