'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SITE_CONFIG } from '@/constants/config';
import { X, Send } from 'lucide-react';
import Groq from 'groq-sdk';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  image: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are CodeCraft's expert AI sales agent. Your role is to help students choose and enroll in our programming courses.
Course prices are in PKR
AVAILABLE COURSES:
{{courses}}

Your responsibilities:
- Recommend specific courses based on student's needs
- Quote exact prices from course data
- Highlight practical benefits and job skills
- Guide enrollment process
- Handle pricing questions confidently
- Provide clear next steps

Response guidelines:
- Keep responses under 100 words
- Include course names and prices
- End with call-to-action
- Stay factual and transparent
- Focus on converting inquiries to enrollments`;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    fetchCourses();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT.replace('{{courses}}', JSON.stringify(courses, ['title', 'description', 'price', 'features'], 2))
          },
          ...chatMessages,
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || 'No response generated';
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Courses', href: '#courses' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg overflow-hidden">
                <Image
                  src="/images/brand-icon.png"
                  alt="Brand Icon"
                  width={40}
                  height={40}
                  className="object-cover mix-blend-overlay"
                  priority
                />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                {SITE_CONFIG.name}
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  } hover:text-primary-500`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => setIsChatOpen(true)}
                className={`px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 ${
                  isScrolled
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-white text-primary-600 hover:bg-primary-50'
                }`}
              >
                Chat with Advisor
              </button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-2xl"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsChatOpen(true);
                  }}
                  className="block w-full px-6 py-3 bg-primary-600 text-white rounded-full font-semibold text-center hover:bg-primary-700 transition-colors"
                >
                  Chat with Advisor
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 text-blue-500">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Advisor</h2>
              <button onClick={() => setIsChatOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!chatMessages.length && (
                <div className="text-gray-500 text-center">
                  👋 Hi! Ask me anything about our courses!
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                key={idx}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-blue-500 ml-auto text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>              
              ))}
              {isLoading && (
                <div className="bg-gray-100 p-3 rounded-lg animate-pulse text-gray-800">
                  Thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about our courses..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
