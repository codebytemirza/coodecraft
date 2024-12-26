import Navbar from '@/components/common/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Courses from '@/components/sections/Courses';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/common/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <Contact />
      <Footer />
    </main>
  );
}