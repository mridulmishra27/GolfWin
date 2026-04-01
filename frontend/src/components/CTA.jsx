import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiShield, FiHeart, FiLock } from 'react-icons/fi';

export default function CTA() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-24 bg-deep-900 relative">
      <div className="section-container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden glass-card border border-electric/20 p-8 md:p-16 text-center"
        >
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-mesh opacity-50 z-0 mix-blend-screen"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white">
              Ready to Make Your <br/> Numbers <span className="gradient-text">Count?</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 font-medium">
              Join thousands of players winning weekly rewards while funding verified charities across the globe.
            </p>
            
            <a href="#pricing" className="btn-primary text-lg px-12 py-5 shadow-glow-cyan w-full sm:w-auto">
              Subscribe Now
            </a>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <FiShield className="text-electric" size={20} /> Verified Draws
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <FiLock className="text-orchid" size={20} /> Secure Payments
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <FiHeart className="text-amber" size={20} /> Direct Charity Impact
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
