import { motion } from 'framer-motion';

export default function Hero() {
  // random numbers for the floating orbs
  const randomNumbers = [7, 14, 23, 38, 42];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-mesh">
      {/* Ambient Orbs */}
      <div className="ambient-orb ambient-orb-1 top-1/4 right-1/4" />
      <div className="ambient-orb ambient-orb-2 bottom-1/4 left-1/4" />

      <div className="section-container relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl text-center lg:text-left pt-12 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-electric/30 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-electric animate-pulse"></span>
            <span className="text-sm font-medium text-electric">Monthly Draw </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
            Pick Your Numbers. <br />
            <span className="gradient-text">Change a Life.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed font-body">
            Subscribe, choose your 5 lucky numbers, and match the weekly draw. Win rewards while directly funding verified charities making a real impact.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <a href="#pricing" className="btn-primary w-full sm:w-auto">
              Start Playing
            </a>
            <a href="#how-it-works" className="btn-secondary w-full sm:w-auto">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Right Column: Visualizer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative h-[400px] lg:h-[600px] flex items-center justify-center"
        >
          {/* Central glowing hub */}
          <div className="absolute w-64 h-64 rounded-full bg-deep-700/50 backdrop-blur-3xl border border-surface-border shadow-glow-orchid animate-pulse-glow flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-heading font-bold gradient-text mb-1">₹500K+</div>
              <div className="text-sm font-medium text-gray-400">Given to Charity</div>
            </div>
          </div>

          {/* Floating Number Orbs */}
          {randomNumbers.map((num, i) => {
            // Distribute in a circle
            const angle = (i / randomNumbers.length) * Math.PI * 2;
            const radius = 160; // Distance from center
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={i}
                className="absolute number-orb w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x, y, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6 + i * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                style={{
                  // Add continuous floating animation via CSS class
                  animation: `float ${4 + i}s ease-in-out ${i * 0.5}s infinite`,
                }}
              >
                {num}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden lg:flex"
      >
        <span className="text-xs tracking-widest uppercase text-gray-500 font-medium">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
      </motion.div>
    </section>
  );
}
