'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Course {
    _id?: string;
    title: string;
    description: string;
    price: number;
    image: string;
    features: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default function AdminPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isAuth, setIsAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuth) {
            fetchCourses();
        }
    }, [isAuth]);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/courses');
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            alert('Failed to fetch courses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '123456') {
            setIsAuth(true);
        } else {
            alert('Invalid password');
        }
    };

    const handleAddCourse = () => {
        const newCourse: Course = {
            title: 'New Course',
            description: '',
            price: 0,
            image: '',
            features: []
        };
        setCourses(prev => [...prev, newCourse]);
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses?id=${courseId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete course');
            }

            setCourses(prev => prev.filter(course => course._id !== courseId));
            setActiveCourseId(null);
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courses })
            });

            if (!response.ok) {
                throw new Error('Failed to save courses');
            }

            await fetchCourses();
            alert('Saved successfully!');
        } catch (error) {
            console.error('Error saving courses:', error);
            alert('Error saving changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCourseUpdate = (courseId: string, field: keyof Course, value: any) => {
        setCourses(prev => prev.map(course =>
            course._id === courseId ? { ...course, [field]: value } : course
        ));
    };

    const handleImageUpload = async (courseId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const { imagePath } = await response.json();
            handleCourseUpdate(courseId, 'image', imagePath);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };

    if (!isAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <form onSubmit={handleAuth} className="p-8 bg-gray-800 rounded-lg shadow-xl">
                    <h1 className="text-2xl font-bold text-white mb-6">Admin Access</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
                        placeholder="Admin Password"
                    />
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Course Management</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleAddCourse}
                            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Add New Course
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700
                                ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSaving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {courses.map(course => (
                        <div key={course._id || Math.random()} className="bg-gray-800 rounded-lg shadow-xl p-4">
                            <div className="flex justify-between items-center">
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setActiveCourseId(
                                        activeCourseId === course._id ? null : course._id || null
                                    )}
                                >
                                    <h2 className="text-xl font-bold text-white">{course.title}</h2>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {course._id && (
                                        <button
                                            onClick={() => handleDeleteCourse(course._id!)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <span className="text-white">
                                        {activeCourseId === course._id ? '▼' : '▶'}
                                    </span>
                                </div>
                            </div>

                            {activeCourseId === course._id && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={course.title}
                                            onChange={(e) => handleCourseUpdate(
                                                course._id!,
                                                'title',
                                                e.target.value
                                            )}
                                            className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">
                                            Description
                                        </label>
                                        <textarea
                                            value={course.description}
                                            onChange={(e) => handleCourseUpdate(
                                                course._id!,
                                                'description',
                                                e.target.value
                                            )}
                                            className="mt-1 w-full p-2 bg-gray-700 text-white rounded h-24"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            value={course.price}
                                            onChange={(e) => handleCourseUpdate(
                                                course._id!,
                                                'price',
                                                Number(e.target.value)
                                            )}
                                            className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">
                                            Features
                                        </label>
                                        <textarea
                                            value={course.features.join('\n')}
                                            onChange={(e) => handleCourseUpdate(
                                                course._id!,
                                                'features',
                                                e.target.value.split('\n')
                                            )}
                                            className="mt-1 w-full p-2 bg-gray-700 text-white rounded h-24"
                                            placeholder="One feature per line"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400">
                                            Image
                                        </label>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Upload New Image
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={(e) => handleImageUpload(course._id!, e)}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            {course.image && (
                                                <div className="relative h-20 w-20">
                                                    <Image
                                                        src={course.image}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                    <button
                                                        onClick={() => handleCourseUpdate(course._id!, 'image', '')}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
