'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Course {
  _id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  features: string[];
  price: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollNow = (courseTitle: string) => {
    const message = encodeURIComponent(`I'm interested in enrolling in ${courseTitle}`);
    window.open(`https://wa.me/923088403978?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Courses</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white/50" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-primary-600">Our Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our wide range of courses designed to help you master modern technologies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl 
                transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 p-6 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform">
                    {course.title}
                  </h3>
                  <div className="flex gap-3 justify-center">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      {course.duration}
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">{course.description}</p>

                <div className="space-y-3 mb-6">
                  {course.features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors group/item"
                    >
                      <div className="w-5 h-5 mr-2 rounded-full bg-primary-100 flex items-center justify-center group-hover/item:bg-primary-200 transition-colors">
                        <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-primary-600">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                      PKR {course.price.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnrollNow(course.title)}
                    className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full hover:scale-105 transition-all duration-300 transform"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}