'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
}

interface CoursesData {
  courses: Course[];
}

export default function AdminPage() {
  const [coursesData, setCoursesData] = useState<CoursesData>({ courses: [] });
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuth(true);
      fetch('/api/courses')
        .then(res => res.json())
        .then(json => setCoursesData(json));
    }
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: Date.now(), // Simple unique ID generation
      title: 'New Course',
      description: '',
      price: 0,
      image: '',
      features: []
    };
    
    setCoursesData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
    setActiveCourseId(newCourse.id);
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCoursesData(prev => ({
        ...prev,
        courses: prev.courses.filter(course => course.id !== courseId)
      }));
      setActiveCourseId(null);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursesData)
      });
      alert('Saved successfully!');
    } catch (err) {
      alert('Error saving changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseUpdate = (courseId: number, field: keyof Course, value: any) => {
    setCoursesData(prev => ({
      ...prev,
      courses: prev.courses.map(course => 
        course.id === courseId ? { ...course, [field]: value } : course
      )
    }));
  };

  const handleImageUpload = async (courseId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId.toString());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const { imagePath } = await response.json();
      handleCourseUpdate(courseId, 'image', imagePath);
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
          <div className="space-x-4">
            <button
              onClick={handleAddCourse}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add New Course
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {coursesData.courses.map(course => (
            <div key={course.id} className="bg-gray-800 rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-center">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setActiveCourseId(activeCourseId === course.id ? null : course.id)}
                >
                  <h2 className="text-xl font-bold text-white">{course.title}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                  <span className="text-white">{activeCourseId === course.id ? '▼' : '▶'}</span>
                </div>
              </div>

              {activeCourseId === course.id && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Title</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => handleCourseUpdate(course.id, 'title', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea
                      value={course.description}
                      onChange={(e) => handleCourseUpdate(course.id, 'description', e.target.value)}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Price</label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) => handleCourseUpdate(course.id, 'price', Number(e.target.value))}
                      className="mt-1 w-full p-2 bg-gray-700 text-white rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400">Features</label>
                    <textarea
                      value={course.features.join('\n')}
                      onChange={(e) => handleCourseUpdate(course.id, 'features', e.target.value.split('\n'))}
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
                        onChange={(e) => handleImageUpload(course.id, e)}
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}