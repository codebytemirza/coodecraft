'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SITE_CONFIG } from '@/constants/config';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  level: string;
  features: string[];
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data.courses);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollNow = (courseTitle: string) => {
    const message = encodeURIComponent(`I'm interested in enrolling in ${courseTitle}`);
    window.open(`https://wa.me/${SITE_CONFIG.contact.phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gray-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white/50" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
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

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {/* Course Image with Gradient Overlay */}
              <div className="relative h-48 bg-gradient-to-r from-primary-600 to-secondary-600">
                <Image
                  src={course.image}
                  alt={course.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover mix-blend-overlay opacity-90"
                  priority={index === 0}
                />
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-600 rounded-full text-sm font-medium">
                    {course.duration}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">{course.description}</p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {course.features.map((feature, idx) => (
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

                {/* Price and Action */}
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