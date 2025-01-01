'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnrollmentForm from './EnrollmentForm';
import { AlertCircle, Calendar, Users, Clock, BookOpen, ChevronRight, Star, Award, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Batch {
  startDate: string;
  endDate: string;
  seats: number;
  enrolledStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  batchCode: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  features: string[];
  price: number;
  batches: Batch[];
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing'>('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActiveBatch = (batches: Batch[]) => {
    return batches.find(batch =>
      (filter === 'all' && (batch.status === 'upcoming' || batch.status === 'ongoing')) ||
      (filter === 'upcoming' && batch.status === 'upcoming') ||
      (filter === 'ongoing' && batch.status === 'ongoing')
    );
  };

  const getBatchStatusStyles = (status: string) => {
    const styles = {
      upcoming: 'text-amber-600 bg-amber-50 border-amber-100',
      ongoing: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      completed: 'text-gray-600 bg-gray-50 border-gray-100',
      cancelled: 'text-red-600 bg-red-50 border-red-100'
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const getSeatsLeftMessage = (batch: Batch) => {
    const seatsLeft = batch.seats - batch.enrolledStudents;
    if (seatsLeft <= 0) return 'Batch Full';
    if (seatsLeft <= 5) return `Only ${seatsLeft} seats left!`;
    return `${seatsLeft} seats available`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary-200 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-t-4 border-primary-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="bg-red-50 max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-700 mb-2">Error Loading Courses</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section id="courses" className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(120,119,198,0.1),transparent)]" />
      <div className="absolute inset-0 bg-grid-primary-600/[0.02] bg-[size:20px_20px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 mb-6">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Quality Courses</span>
          </div>

          <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            Explore Our Courses
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Master modern technologies with our expertly crafted courses designed for all skill levels
          </p>

          <div className="flex justify-center gap-4">
            {['all', 'upcoming', 'ongoing'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} Batches
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8">
          {courses.map((course, index) => {
            const activeBatch = getActiveBatch(course.batches);

            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="h-56 bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-t-3xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-grid-white/[0.2] bg-[size:10px_10px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_-100px,rgba(255,255,255,0.1),transparent)]" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      {course.level === 'Beginner' && <Trophy className="w-5 h-5 text-yellow-300" />}
                      {course.level === 'Intermediate' && <Award className="w-5 h-5 text-blue-300" />}
                      {course.level === 'Advanced' && <Star className="w-5 h-5 text-purple-300" />}
                      <span className="text-white/80 text-sm">{course.level}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:translate-x-2 transition-transform">
                      {course.title}
                    </h3>

                    <div className="flex gap-3">
                      <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
                        <BookOpen className="w-4 h-4" />
                        {course.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-gray-600 mb-8 leading-relaxed">{course.description}</p>

                  {activeBatch && (
                    <div className="mb-8 p-6 border rounded-2xl bg-gray-50/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        <h4 className="font-medium text-gray-900">Next Batch Details</h4>
                        <span className={`ml-auto text-xs px-3 py-1.5 rounded-full capitalize border ${getBatchStatusStyles(activeBatch.status)}`}>
                          {activeBatch.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Duration</span>
                          <span className="font-medium">{formatDate(activeBatch.startDate)} - {formatDate(activeBatch.endDate)}</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-600">
                          <span>Batch Code</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{activeBatch.batchCode}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            <Users className="w-4 h-4 inline mr-1" />
                            Seats
                          </span>
                          <span className={`font-medium ${activeBatch.seats - activeBatch.enrolledStudents <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {getSeatsLeftMessage(activeBatch)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    {course.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-gray-600 group/item"
                      >
                        <ChevronRight className="w-4 h-4 mr-2 text-primary-600 group-hover/item:translate-x-1 transition-transform" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="text-primary-600">
                      <span className="text-sm text-gray-500 block mb-1">Course Fee</span>
                      <span className="text-3xl font-bold">
                        PKR {course.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsFormOpen(true);
                      }}
                      className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full
                        transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary-600/20
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        disabled:hover:shadow-none"
                      disabled={!activeBatch || activeBatch.seats - activeBatch.enrolledStudents <= 0}
                    >
                      {!activeBatch ? 'No Batch Available' :
                       activeBatch.seats - activeBatch.enrolledStudents <= 0 ? 'Batch Full' :
                       'Enroll Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <EnrollmentForm
              course={selectedCourse}
              isOpen={isFormOpen}
              onClose={() => {
                setIsFormOpen(false);
                setSelectedCourse(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
