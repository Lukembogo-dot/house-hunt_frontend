import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaBullhorn, FaCheckCircle, FaChartLine, FaUsers, FaShieldAlt, FaChartBar, FaSearch } from 'react-icons/fa';
import useSeoData from '../hooks/useSeoData';
import { Helmet } from 'react-helmet-async';

// ✅ 1. INLINE SEO COMPONENT (To ensure stability)
const SeoInjector = ({ seo }) => (
  <Helmet>
    <title>{seo.metaTitle || 'List for Free | HouseHunt for Agents'}</title>
    <meta name="description" content={seo.metaDescription || 'Join HouseHunt Kenya for free. Boost sales, connect with clients, and access real-time analytics.'} />
    <meta property="og:title" content={seo.metaTitle || 'List for Free | HouseHunt for Agents'} />
    <meta property="og:description" content={seo.metaDescription || 'Join HouseHunt Kenya for free.'} />
  </Helmet>
);

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
  const { seo } = useSeoData(
    '/for-agents',
    'List for Free | HouseHunt for Agents & Property Managers',
    'Join HouseHunt Kenya for free. We help real estate firms and property management companies in Kenya boost sales, connect with clients, and grow their business with zero fees.'
  );

  // ✅ 2. UPDATED FEATURES TO SELL YOUR NEW TOOLS
  const features = [
    {
      icon: FaBullhorn,
      title: "Zero Fees, Maximum Exposure",
      text: "List all your properties for free. We don't charge commissions or listing fees. Keep 100% of what you earn."
    },
    {
      icon: FaUsers,
      title: "Qualified Leads",
      text: "Connect directly with serious buyers. Our system filters requests so you get high-quality leads sent straight to WhatsApp."
    },
    {
      icon: FaShieldAlt, // Updated Icon
      title: "Get Verified Status",
      text: "Stand out with a specialized Verified Agent badge. Build instant trust with clients and rank higher in search results."
    },
    {
      icon: FaChartBar, // Updated Icon
      title: "Real-Time Analytics",
      text: "Access your personal dashboard to track listing views, clicks, and performance. See exactly what buyers are looking for."
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
              Grow Your Real Estate Business
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              The smartest platform for Kenyan agents. List properties, track analytics, and build your brand—<span className="font-bold underline">completely free</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                Start Listing for Free
              </Link>
              {/* ✅ 3. NEW "CLAIM PROFILE" LINK */}
              <Link
                to="/agents"
                className="px-10 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <FaSearch className="inline mr-2 mb-1" />
                Check if I'm Listed
              </Link>
            </div>
            <p className="mt-4 text-sm text-blue-200">
              Already have properties on HouseHunt? Find your name and claim your account.
            </p>
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
              Why Top Agents Choose <span className="text-blue-600">HouseHunt</span>
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700 hover:-translate-y-2 transition-transform duration-300"
                  custom={i} // Staggered delay for each card
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={bouncyCard}
                >
                  <feature.icon className="text-4xl text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
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
              {[
                { title: 'Create Free Account', desc: 'Sign up in seconds with your email or WhatsApp.' },
                { title: 'Post Your Listings', desc: 'Upload photos and details. We optimize them for SEO.' },
                { title: 'Receive Leads', desc: 'Get inquiries directly from verified buyers and renters.' }
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  className="flex-1 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={bouncyCard}
                >
                  <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">0{i + 1}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{step.desc}</p>
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
            <h2 className="text-4xl font-extrabold mb-6">Ready to Dominate the Market?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Join the community of top-tier real estate firms in Kenya. 
              Build your brand, track your success, and close more deals.
            </p> 
            <Link
              to="/register"
              className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              Create My Free Account
            </Link>
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default ForAgents;