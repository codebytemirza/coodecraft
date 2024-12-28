'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  level: string;
  features: string[];
  isActive: boolean;
  enrollmentCount?: number;
  rating?: {
    average: number;
    count: number;
  };
  categories?: string[];
  requirements?: string[];
  language?: string;
  certificate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuth(true);
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        alert('Error loading courses');
      }
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
      duration: '4 weeks',
      level: 'Beginner',
      features: [],
      isActive: true
    };
    
    setCourses(prev => [...prev, newCourse]);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCourses(prev => prev.filter(course => course._id !== courseId));
        setActiveCourseId(null);
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (error) {
      alert('Error deleting course');
    }
  };

  const handleSave = async (course: Course) => {
    setIsLoading(true);
    try {
      const method = course._id ? 'PUT' : 'POST';
      const url = course._id ? `/api/courses/${course._id}` : '/api/courses';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save course');
      }

      const savedCourse = await response.json();
      
      setCourses(prev => 
        prev.map(c => 
          c._id === course._id ? savedCourse : c
        )
      );

      if (!course._id) {
        setCourses(prev => [...prev, savedCourse]);
      }

      alert('Saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving changes: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseUpdate = (courseId: string | undefined, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(course => 
      course._id === courseId ? { ...course, [field]: value } : course
    ));
  };

  const handleImageUpload = async (courseId: string | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (courseId) formData.append('courseId', courseId);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const { imageUrl } = await response.json();
      handleCourseUpdate(courseId, 'image', imageUrl);
    } catch (err) {
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
          <button type="submit" className="mt-4 w-full bg-primary-600 text-white p-3 rounded hover:bg-primary-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <button
            onClick={handleAddCourse}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Course
          </button>
        </div>

        <div className="space-y-4">
          {courses.map(course => (
            <div key={course._id} className="bg-gray-800 rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-center">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setActiveCourseId(activeCourseId === course._id ? null : course._id!)}
                >
                  <h2 className="text-xl font-bold text-white">{course.title}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSave(course)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id!)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                  <span className="text-white">{activeCourseId === course._id ? '▼' : '▶'}</span>
                </div>
              </div>

              {activeCourseId === course._id && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Title</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => handleCourseUpdate(course._id, 'title', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea
                      value={course.description}
                      onChange={(e) => handleCourseUpdate(course._id, 'description', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Price</label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) => handleCourseUpdate(course._id, 'price', Number(e.target.value))}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Duration</label>
                    <input
                      type="text"
                      value={course.duration}
                      onChange={(e) => handleCourseUpdate(course._id, 'duration', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Level</label>
                    <select
                      value={course.level}
                      onChange={(e) => handleCourseUpdate(course._id, 'level', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Features</label>
                    <textarea
                      value={course.features.join('\n')}
                      onChange={(e) => handleCourseUpdate(course._id, 'features', e.target.value.split('\n'))}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded h-24"
                      placeholder="One feature per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Image</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Upload New Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleImageUpload(course._id, e)}
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
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Status</label>
                    <div className="mt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={course.isActive}
                          onChange={(e) => handleCourseUpdate(course._id, 'isActive', e.target.checked)}
                          className="form-checkbox h-5 w-5 text-primary-600"
                        />
                        <span className="ml-2 text-white">Active</span>
                      </label>
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