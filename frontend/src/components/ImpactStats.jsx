import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function AnimatedCounter({ end, duration = 2, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      let startTime = null;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // Easing function: easeOutQuart
        const easeOut = 1 - Math.pow(1 - progress, 4);
        
        setCount(Math.floor(easeOut * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStats() {
  const stats = [
    { label: "Total Raised", value: 500000, prefix: "₹", suffix: "+", color: "text-electric" },
    { label: "Active Players", value: 12500, prefix: "", suffix: "", color: "text-white" },
    { label: "Draws Completed", value: 104, prefix: "", suffix: "", color: "text-white" },
    { label: "Charities Supported", value: 12, prefix: "", suffix: "", color: "text-orchid" },
  ];

  return (  
   <section id="impact" className="py-20 bg-deep-800 relative border-y border-surface-border"
>
      <div className="absolute inset-0 bg-gradient-to-r from-deep-900 via-deep-800 to-deep-900 opacity-80 z-0"></div>
      
      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x-0 md:divide-x divide-surface-border">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center justify-center p-4"
            >
              <div className={`text-4xl md:text-5xl font-heading font-black mb-2 ${stat.color}`}>
                <AnimatedCounter 
                  end={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                />
              </div>
              <div className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
