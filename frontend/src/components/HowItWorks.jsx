import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiCheckSquare, FiAward, FiHeart } from 'react-icons/fi';

export default function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const steps = [
    {
      icon: <FiCheckSquare size={32} className="text-electric" />,
      title: "1. Pick Your Numbers",
      desc: "Subscribe and choose 5 numbers between 1 and 45. You can change them before any weekly draw.",
      color: "border-electric/30 shadow-glow-cyan",
    },
    {
      icon: <FiAward size={32} className="text-amber" />,
      title: "2. The Monthly Draw",
      desc: "Every month, 5 random numbers are drawn. Match 3 or more numbers to win rewards.",
      color: "border-amber/30 shadow-glow-amber",
    },
    {
      icon: <FiHeart size={32} className="text-orchid" />,
      title: "3. Fund Charities",
      desc: "A portion of every subscription goes directly to verified charities. You win, they win.",
      color: "border-orchid/30 shadow-glow-orchid",
    }
  ];

  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden bg-deep-900">
      <div className="section-container" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Simple Process. <span className="gradient-text">Massive Impact.</span>
          </h2>
          <p className="text-lg text-gray-400">
            Playing is easy as counting to three. Join a community that turns a fun weekly draw into real-world charitable giving.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-electric via-amber to-orchid opacity-30 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center glass-card border mb-6 relative group transition-transform duration-300 hover:scale-110 ${step.color}`}>
                <div className="absolute inset-0 bg-white/5 rounded-full z-0 group-hover:bg-white/10 transition-colors"></div>
                <div className="relative z-10">{step.icon}</div>
              </div>
              
              <h3 className="text-2xl font-heading font-bold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400 px-4 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
