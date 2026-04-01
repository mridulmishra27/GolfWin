import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Impact', href: '#impact' },
    { name: 'Charities', href: '#charities' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4 glass-card border-b-0 shadow-glow-cyan/10' : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="section-container flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 z-50 relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-orchid flex items-center justify-center shadow-glow-cyan text-deep-900 font-bold text-xl">
              G
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-white">
              Golf<span className="text-electric">Win</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary py-2 px-6 text-sm">
                  Control Panel
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:text-electric font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary py-2 px-6 text-sm">
                    Subscribe
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 relative text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-deep-900/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col h-screen"
          >
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-heading font-semibold text-white hover:text-electric border-b border-surface-border pb-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-4 mt-8">
                <a
                  href="#"
                  className="btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="#pricing"
                  className="btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Subscribe Now
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
