"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Image as ImageIcon, ChevronDown, ChevronRight, Plus, Save, Trash2, X, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Batch {
  startDate: string;
  endDate: string;
  seats: number;
  enrolledStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  batchCode: string;
}

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  features: string[];
  duration: string;
  level: string;
  batches: Batch[];
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'batches'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuth) fetchCourses();
  }, [isAuth]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      showNotification('error', 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuth(true);
    } else {
      showNotification('error', 'Invalid password');
    }
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      title: 'New Course',
      description: '',
      price: 0,
      image: '',
      features: [],
      duration: '3 months',
      level: 'Beginner',
      batches: [{
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        seats: 30,
        enrolledStudents: 0,
        status: 'upcoming',
        batchCode: `BATCH-${Math.random().toString(36).substring(7).toUpperCase()}`
      }]
    };
    setCourses(prev => [...prev, newCourse]);
    setActiveCourseId(newCourse._id || null);
    setActiveTab('details');
  };

  const handleCourseUpdate = (courseId: string, field: keyof Course, value: any) => {
    setCourses(prev => prev.map(course =>
      course._id === courseId ? { ...course, [field]: value } : course
    ));
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses?id=${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete course');

      setCourses(prev => prev.filter(course => course._id !== courseId));
      setActiveCourseId(null);
      showNotification('success', 'Course deleted successfully');
    } catch (error) {
      showNotification('error', 'Failed to delete course');
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

      if (!response.ok) throw new Error('Failed to save changes');

      await fetchCourses();
      showNotification('success', 'Changes saved successfully');
    } catch (error) {
      showNotification('error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
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

      if (!response.ok) throw new Error('Failed to upload image');

      const { imagePath } = await response.json();
      handleCourseUpdate(courseId, 'image', imagePath);
      showNotification('success', 'Image uploaded successfully');
    } catch (error) {
      showNotification('error', 'Failed to upload image');
    }
  };

  const handleAddBatch = (courseId: string) => {
    const course = courses.find(c => c._id === courseId);
    if (!course) return;

    const newBatch: Batch = {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      seats: 30,
      enrolledStudents: 0,
      status: 'upcoming',
      batchCode: `${course.title.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}${(new Date().getMonth() + 2).toString().padStart(2, '0')}`
    };

    setCourses(prev => prev.map(c =>
      c._id === courseId
        ? { ...c, batches: [...c.batches, newBatch] }
        : c
    ));
  };

  const handleDeleteBatch = (courseId: string, batchIndex: number) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;

    setCourses(prev => prev.map(course => {
      if (course._id === courseId) {
        const newBatches = [...course.batches];
        newBatches.splice(batchIndex, 1);
        return { ...course, batches: newBatches };
      }
      return course;
    }));
  };

  const handleUpdateBatch = (courseId: string, batchIndex: number, field: keyof Batch, value: any) => {
    setCourses(prev => prev.map(course => {
      if (course._id === courseId) {
        const newBatches = [...course.batches];
        newBatches[batchIndex] = { ...newBatches[batchIndex], [field]: value };
        return { ...course, batches: newBatches };
      }
      return course;
    }));
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const renderCourseDetails = (course: Course) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => handleCourseUpdate(course._id!, 'title', e.target.value)}
            className="mt-1 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={course.description}
            onChange={(e) => handleCourseUpdate(course._id!, 'description', e.target.value)}
            rows={4}
            className="mt-1 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Features (one per line)</label>
          <textarea
            value={course.features.join('\n')}
            onChange={(e) => handleCourseUpdate(course._id!, 'features', e.target.value.split('\n'))}
            rows={4}
            className="mt-1 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter course features..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Price</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={course.price}
                onChange={(e) => handleCourseUpdate(course._id!, 'price', Number(e.target.value))}
                className="pl-10 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Duration</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={course.duration}
                onChange={(e) => handleCourseUpdate(course._id!, 'duration', e.target.value)}
                className="pl-10 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 3 months"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Level</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={course.level}
              onChange={(e) => handleCourseUpdate(course._id!, 'level', e.target.value)}
              className="pl-10 w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Course Image</label>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              <ImageIcon size={16} />
              <span>Upload Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImageUpload(course._id!, e)}
              accept="image/*"
              className="hidden"
            />
            {course.image && (
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <button
                  onClick={() => handleCourseUpdate(course._id!, 'image', '')}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBatchesTab = (course: Course) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-200">Batch Management</h3>
        <button
          onClick={() => handleAddBatch(course._id!)}
          className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus size={16} />
          <span>Add Batch</span>
        </button>
      </div>
      <div className="grid gap-4">
        {course.batches.map((batch, index) => (
          <div key={batch.batchCode} className="bg-gray-700 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">Batch {batch.batchCode}</span>
              <button
                onClick={() => handleDeleteBatch(course._id!, index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={batch.startDate.split('T')[0]}
                  onChange={(e) => handleUpdateBatch(course._id!, index, 'startDate', e.target.value)}
                  className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">End Date</label>
                <input
                  type="date"
                  value={batch.endDate.split('T')[0]}
                  onChange={(e) => handleUpdateBatch(course._id!, index, 'endDate', e.target.value)}
                  className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Total Seats</label>
                <input
                  type="number"
                  value={batch.seats}
                  onChange={(e) => handleUpdateBatch(course._id!, index, 'seats', parseInt(e.target.value))}
                  className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Enrolled Students</label>
                <input
                  type="number"
                  value={batch.enrolledStudents}
                  onChange={(e) => handleUpdateBatch(course._id!, index, 'enrolledStudents', parseInt(e.target.value))}
                  className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400">Status</label>
                <select
                  value={batch.status}
                  onChange={(e) => handleUpdateBatch(course._id!, index, 'status', e.target.value)}
                  className="mt-1 w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      {notification && (
        <Alert className={`fixed top-4 right-4 w-96 z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Course Management</h1>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleAddCourse}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              <span>Add Course</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {courses.map(course => (
            <div key={course._id || Math.random()} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setActiveCourseId(activeCourseId === course._id ? null : course._id || null)}
              >
                <div className="flex items-center space-x-4">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-white">{course.title}</h2>
                    <p className="text-gray-400">{course.level} • {course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {course._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course._id!);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  {activeCourseId === course._id ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                </div>
              </div>

              {activeCourseId === course._id && (
                <div className="border-t border-gray-700 p-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`px-4 py-2 rounded-md ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Course Details
                    </button>
                    <button
                      onClick={() => setActiveTab('batches')}
                      className={`px-4 py-2 rounded-md ${activeTab === 'batches' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Batch Management
                    </button>
                  </div>

                  {activeTab === 'details' ? renderCourseDetails(course) : renderBatchesTab(course)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
