import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getCharities } from '../api/api';
import { Link } from 'react-router-dom';

export default function CharityShowcase() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [charities, setCharities] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCharities();
        const list = res?.data?.charities || [];
        if (!mounted) return;
        const spotlight = Array.isArray(list) ? list.filter((c) => c.isSpotlight).slice(0, 3) : [];
        setCharities(spotlight);
      } catch {
        
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="charities" className="section-padding bg-deep-900 relative">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-orchid/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="section-container" ref={ref}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              The Real <span className="gradient-text">Winners.</span>
            </h2>
            <p className="text-lg text-gray-400">
              A portion of every ticket goes directly to verified charities making tangible changes in the world. See who we're supporting this month.
            </p>
          </motion.div>
          
          <motion.a
            href="/charities"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-electric font-semibold hover:text-white transition-colors"
          >
            View All Charities <FiArrowRight />
          </motion.a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {charities.map((charity, index) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative overflow-hidden rounded-2xl glass-card border border-surface-border cursor-pointer h-[400px]"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${charity.image || (charity.images && charity.images[0]) || ''})` }}
              ></div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-electric/40 via-deep-900/80 to-deep-900/40 opacity-90"></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:translate-y-0 translate-y-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 font-heading">
                    Spotlight charity
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-heading leading-tight">
                    {charity.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {charity.description || 'Learn more about this organisation.'}
                  </p>
                  
                  <Link
                    to={`/charities/${charity.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"
                  >
                    Learn More <FiExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
