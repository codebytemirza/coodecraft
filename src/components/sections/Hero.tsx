'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback } from 'react';

export default function Hero() {
  const handleScroll = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15"></div>
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200 animate-gradient">
              Master Your Coding Journey
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Transform your future with industry-leading courses and expert mentorship
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleScroll('courses')}
                className="bg-white text-primary-900 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-all transform hover:scale-105"
              >
                Explore Courses
              </button>
              <button 
                onClick={() => handleScroll('about')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all transform hover:scale-105"
              >
                Learn More
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-8">
              <div className="flex -space-x-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                    <Image 
                      src={`/avatars/${i}.jpg`}
                      alt={`Student ${i}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      priority={i === 1}
                    />
                  </div>
                ))}
              </div>
              <div className="text-primary-100">
                <p className="text-2xl font-bold">1,000+</p>
                <p>Students Enrolled</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative block" // Removed hidden md:block
          >
            <div className="relative z-10 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 rounded-2xl p-4 md:p-8 backdrop-blur-xl border border-white/10">
              <Image
                src="/images/dashboard-preview.png"
                alt="Platform Preview"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl w-full h-auto"
                priority
              />
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-conic from-primary-500 via-secondary-500 to-primary-500 opacity-30 blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}