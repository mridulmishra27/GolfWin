import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { cancelSubscription, createCheckoutSession, renewSubscription } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function PricingPlans() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState('');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: "Monthly",
      key: "monthly",
      price: "199",
      cycle: "/ month",
      desc: "Best for flexibility",
      features: [
        "Full access to score tracking",
        "Draw participation while active",
        "Cancel anytime",
        "Charity contribution enabled",
      ],
      cta: "Choose Monthly",
      highlight: false,
      color: "text-electric"
    },
    {
      name: "Yearly",
      key: "yearly",
      price: "1999",
      cycle: "/ year",
      desc: "Discounted annual commitment",
      features: [
        "Save compared to monthly billing",
        "Priority uninterrupted access",
        "Draw participation while active",
        "Charity contribution enabled",
      ],
      cta: "Choose Yearly",
      highlight: true,
      color: "text-orchid"
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setLoadingPlan(plan);
      const response = await createCheckoutSession(plan);
      const session = response?.data;
      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      // Bypass: refresh user and go to dashboard
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to subscribe');
    } finally {
      setLoadingPlan('');
    }
  };

  const handleRenew = async () => {
    try {
      setLoadingPlan('renew');
      const res = await renewSubscription();
      const session = res?.data;
      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      await refreshUser();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to renew subscription');
    } finally {
      setLoadingPlan('');
    }
  };

  const handleCancel = async () => {
    try {
      setLoadingPlan('cancel');
      await cancelSubscription();
      await refreshUser();
    } catch (error) {
      toast.error(error.message || 'Unable to cancel subscription');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <section id="pricing" className="section-padding bg-deep-800 relative border-t border-surface-border">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-electric/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="section-container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Choose Your <span className="gradient-text">Impact Plan.</span>
          </h2>
          <p className="text-lg text-gray-400">
            Transparent pricing. Cancel anytime. A portion of every paid tier goes directly to verified global charities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative flex flex-col p-8 rounded-3xl glass-card transition-all duration-300 ${
                plan.highlight 
                  ? 'border-orchid/50 shadow-glow-orchid scale-105 z-10 bg-deep-700/60' 
                  : 'border-surface-border hover:border-electric/30 hover:-translate-y-2'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-electric to-orchid text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-heading font-bold mb-2 ${plan.color}`}>{plan.name}</h3>
                <p className="text-gray-400 text-sm min-h-[40px]">{plan.desc}</p>
              </div>

              <div className="mb-8 relative auto-flex">
                <span className="text-5xl font-bold font-heading text-white">₹{plan.price}</span>
                <span className="text-gray-500 font-medium ml-2">{plan.cycle}</span>
              </div>

              <ul className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FiCheck className={`mt-1 flex-shrink-0 ${plan.highlight ? 'text-orchid' : 'text-electric'}`} />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loadingPlan !== '' || user?.subscriptionPlan === plan.key}
                className={`w-full py-4 px-6 rounded-xl font-bold font-heading transition-all duration-300 disabled:opacity-60 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-orchid to-electric text-white shadow-glow-orchid hover:shadow-lg hover:scale-[1.02]'
                  : 'bg-surface-hover text-white hover:bg-white/10 border border-surface-border hover:border-white/20'
              }`}
              >
                {user?.subscriptionPlan === plan.key && user?.subscriptionStatus === 'active' ? 'Current plan' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {user && (
          <div className="max-w-5xl mx-auto mt-8 p-5 rounded-2xl border border-surface-border bg-deep-700/30 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <p className="text-sm text-gray-300">
              Subscription status: <span className="font-semibold text-white uppercase">{user.subscriptionStatus || 'none'}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRenew}
                disabled={loadingPlan !== ''}
                className="px-4 py-2 rounded-lg bg-electric/20 text-electric hover:bg-electric/30 transition-colors disabled:opacity-60"
              >
                Renew
              </button>
              <button
                onClick={handleCancel}
                disabled={loadingPlan !== '' || user?.subscriptionStatus !== 'active'}
                className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
