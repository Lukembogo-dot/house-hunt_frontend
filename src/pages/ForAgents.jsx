import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaBullhorn, FaCheckCircle, FaChartLine, FaUsers } from 'react-icons/fa';
import useSeoData from '../hooks/useSeoData';
import SeoInjector from '../components/SeoInjector';

// Animation for "bouncy" cards
const bouncyCard = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i) => ({ // 'i' is the custom delay index
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      type: "spring", // This creates the "bouncy" effect
      stiffness: 100,
    }
  })
};

// Animation for "slide-in" text
const slideIn = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const ForAgents = () => {
  // 1. Setup SEO
  const seo = useSeoData(
    '/for-agents',
    'List for Free | HouseHunt for Agents & Property Managers',
    'Join HouseHunt Kenya for free. We help real estate firms and property management companies in Kenya boost sales, connect with clients, and grow their business with zero fees.'
  );

  const features = [
    {
      icon: FaBullhorn,
      title: "Zero Fees, Maximum Exposure",
      text: "List all your properties for free. We don't charge commissions or listing fees. Our business model is focused on value-add services, not on your sales."
    },
    {
      icon: FaUsers,
      title: "Connect with Qualified Clients",
      text: "Our platform is built to attract serious buyers and renters. We filter out the noise so you can connect directly with clients who are ready to act."
    },
    {
      icon: FaChartLine,
      title: "Boost Your Sales & Brand",
      text: "We are more than a listing site; we are a growth partner. We showcase your brand to a massive audience, helping you build authority and close more deals."
    },
    {
      icon: FaRocket,
      title: "Built for Real Estate Firms",
      text: "Our dashboard and tools are designed for property management companies and real estate agencies. Manage your listings, track your leads, and grow your portfolio."
    }
  ];

  return (
    <>
      <SeoInjector seo={seo} />
      <div className="bg-white dark:bg-gray-900 overflow-x-hidden">

        {/* --- Hero Section --- */}
        <div className="relative bg-blue-600 dark:bg-blue-800 text-white py-24 md:py-32 px-6 text-center">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <motion.div 
            className="relative z-10 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={bouncyCard}
            custom={0} // No delay
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Grow Your Real Estate Business with HouseHunt
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              The only platform 100% dedicated to helping Kenyan real estate firms, agents, and property managers boost sales. And it's <span className="font-bold underline">completely free</span>.
            </p>
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              Start Listing for Free
            </Link>
          </motion.div>
        </div>

        {/* --- Features Section --- */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              A Platform Designed for <span className="text-blue-600">You</span>
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                  custom={i} // Staggered delay for each card
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={bouncyCard}
                >
                  <feature.icon className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="py-20 px-6 bg-gray-100 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={slideIn}
            >
              Get Started in 3 Simple Steps
            </motion.h2>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              {['Create Your Free Agent Account', 'List Your Properties', 'Connect with Clients'].map((step, i) => (
                <motion.div
                  key={step}
                  className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={bouncyCard}
                >
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-3">0{i + 1}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{step}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="py-24 px-6 bg-blue-600 dark:bg-blue-800 text-white text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={bouncyCard}
          >
            <h2 className="text-4xl font-extrabold mb-6">Ready to Grow Your Business?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Join the growing community of top-tier real estate firms in Kenya who choose HouseHunt to showcase their properties.
            </p> 
            {/* ^-- THIS WAS THE TYPO. It's now fixed. --^ */}
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              Start Listing for Free Today
            </Link>
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default ForAgents;