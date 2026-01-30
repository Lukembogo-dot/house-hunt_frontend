// src/pages/About.jsx

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import useSeoData from "../hooks/useSeoData";
import SeoInjector from "../components/SeoInjector";
import { useFeatureFlag } from "../context/FeatureFlagContext.jsx";

// Define a re-usable animation variant
const fadeInSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function About() {
  const seo = useSeoData(
    '/about',
    'About HouseHunt Kenya - Mission, Vision & Core Values | Property Revolution',
    'Learn about HouseHunt Kenya: our mission to simplify property ownership through technology, vision for Kenya\'s most trusted digital marketplace, and core values of integrity, transparency, and customer satisfaction.'
  );

  const isAgentCtaEnabled = useFeatureFlag('agent-landing-page-cta');
  const isPlatformCtaEnabled = useFeatureFlag('platform-overview-cta');

  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>About HouseHunt Kenya - Mission, Vision & Core Values | Property Revolution</title>
        <meta name="description" content="Learn about HouseHunt Kenya: our mission to simplify property ownership through technology, vision for Kenya's most trusted digital marketplace, and core values of integrity, transparency, and customer satisfaction." />
        <meta name="keywords" content="about HouseHunt Kenya, mission vision values, property revolution Kenya, digital property marketplace Kenya, real estate innovation Kenya, trusted property platform Kenya, HouseHunt story, real estate transparency Kenya" />
        <meta name="headline" content="About HouseHunt Kenya - Revolutionizing Property Search" />
        <meta name="focus_keywords" content="HouseHunt Kenya, about us, mission, vision, values, property revolution, digital marketplace, transparency" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HouseHunt Kenya" />
        <meta property="og:title" content="About HouseHunt Kenya - Mission, Vision & Property Revolution" />
        <meta property="og:description" content="Join Kenya's property revolution! Learn our mission to simplify ownership through technology, our vision for a transparent marketplace, and values of integrity and customer satisfaction." />
        <meta property="og:url" content="https://househuntkenya.com/about" />
        <meta property="og:image" content="https://househuntkenya.com/og-about-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@househuntkenya" />
        <meta name="twitter:creator" content="@househuntkenya" />
        <meta name="twitter:title" content="About HouseHunt Kenya - Property Revolution" />
        <meta name="twitter:description" content="Learn our mission to simplify property ownership, vision for transparent marketplace, and values driving Kenya's most trusted property platform." />
        <meta name="twitter:image" content="https://househuntkenya.com/twitter-about-image.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://househuntkenya.com/about" />

        {/* About Page + Pillar Page Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["WebPage", "AboutPage"],
            "name": "About HouseHunt Kenya",
            "headline": "About HouseHunt Kenya: Mission, Vision & Property Revolution",
            "description": "Comprehensive overview of HouseHunt Kenya's mission to simplify property ownership through technology, vision for Kenya's most trusted digital marketplace, core values of integrity and transparency, and our commitment to revolutionizing real estate in Kenya.",
            "keywords": ["HouseHunt Kenya", "about us", "mission", "vision", "values", "property revolution", "digital marketplace", "real estate innovation", "transparency"],
            "url": "https://househuntkenya.com/about",
            "isPartOf": {
              "@type": "WebSite",
              "name": "HouseHunt Kenya",
              "url": "https://househuntkenya.com"
            },
            "primaryImageOfPage": {
              "@type": "ImageObject",
              "url": "https://househuntkenya.com/about-hero-image.jpg"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://househuntkenya.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "About HouseHunt Kenya",
                  "item": "https://househuntkenya.com/about"
                }
              ]
            },
            "significantLink": [
              "https://househuntkenya.com/our-platform",
              "https://househuntkenya.com/buy",
              "https://househuntkenya.com/rent",
              "https://househuntkenya.com/contact"
            ],
            "mainEntity": {
              "@type": "Organization",
              "name": "HouseHunt Kenya",
              "url": "https://www.househuntkenya.co.ke",
              "logo": "https://www.househuntkenya.co.ke/logo.png",
              "description": "Kenya's most trusted digital property marketplace revolutionizing real estate through AI-powered search, verified listings, and community reviews.",
              "foundingDate": "2025",
              "slogan": "Join the Housing Revolution in Kenya",
              "mission": "To simplify property discovery and ownership through technology, ensuring every client finds a place they can proudly call home.",
              "sameAs": [
                "https://www.facebook.com/househuntkenya",
                "https://twitter.com/househuntkenya",
                "https://instagram.com/househuntkenya"
              ]
            }
          })}
        </script>

        {/* FAQPage Schema for Generative Engines - About Questions */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is HouseHunt Kenya's mission?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HouseHunt Kenya's mission is to simplify property discovery and ownership through technology, ensuring every client finds a place they can proudly call home. We leverage AI-powered search, verified listings, and community reviews to make property hunting transparent, efficient, and trustworthy."
                }
              },
              {
                "@type": "Question",
                "name": "What is HouseHunt Kenya's vision?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our vision is to become Kenya's most trusted digital property marketplace by offering affordable, transparent, and seamless real estate experiences. We aim to revolutionize property search across Kenya from Nairobi to the coast with innovative technology and community-driven insights."
                }
              },
              {
                "@type": "Question",
                "name": "What are HouseHunt Kenya's core values?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HouseHunt Kenya is built on four core values: (1) Integrity and transparency in all transactions, (2) Customer satisfaction as our top priority, (3) Innovation and technology to improve experiences, and (4) Community and sustainability for long-term impact. These principles guide every decision we make."
                }
              },
              {
                "@type": "Question",
                "name": "When was HouseHunt Kenya founded?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HouseHunt Kenya was founded in 2025 with the goal of revolutionizing property search in Kenya. We started with a vision to shift power back to property seekers through verified data, real community intelligence, and a smarter way to find home."
                }
              },
              {
                "@type": "Question",
                "name": "Why did HouseHunt Kenya start?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HouseHunt Kenya was created to address the challenges in Kenya's property market: fake listings, lack of transparency, hidden fees, and difficulty finding authentic reviews. We built a platform that combines AI-powered search, verified listings, Shadow Buildings community reviews, and integrated services to make property hunting easier and more trustworthy for Kenyans."
                }
              },
              {
                "@type": "Question",
                "name": "What makes HouseHunt Kenya different from traditional property agencies?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Unlike traditional agencies, HouseHunt Kenya is a digital-first platform that's free for property seekers, offers AI-powered matching, provides authentic community reviews through Shadow Buildings, includes virtual property tours, has an integrated service directory, and operates 24/7 with property scouts who can access offline listings. We prioritize transparency and technology over commissions."
                }
              },
              {
                "@type": "Question",
                "name": "How can I contact HouseHunt Kenya?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can contact HouseHunt Kenya through multiple channels: WhatsApp support, email at support@househuntkenya.co.ke, or our contact form on the website. We offer 24/7 customer support and our property scouts are always ready to help you find the perfect property."
                }
              }
            ]
          })}
        </script>

        {/* LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "HouseHunt Kenya",
            "image": "https://househuntkenya.com/logo.png",
            "description": "Kenya's most trusted digital property marketplace. Join the housing revolution with AI-powered search, verified listings, and community reviews.",
            "@id": "https://househuntkenya.com",
            "url": "https://househuntkenya.com",
            "telephone": "+254-700-000-000",
            "areaServed": {
              "@type": "Country",
              "name": "Kenya"
            }
          })}
        </script>


      </Helmet>



      <SeoInjector seo={seo} />

      {/* ✅ UPDATED: Clean, Continuous Section with Reduced Spacing */}
      <section className="bg-gray-50 dark:bg-gray-950 min-h-screen pt-32 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* ✅ HERO: Text Only, Animated, No Background Image */}
          <div className="mb-10">
            <motion.h1
              className="text-4xl md:text-7xl font-black mb-4 text-gray-900 dark:text-white leading-tight"
              initial="hidden"
              animate="visible"
              variants={fadeInSlideUp}
            >
              Join the Housing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient">Revolution in Kenya.</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium"
              initial="hidden"
              animate="visible"
              variants={fadeInSlideUp}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
              We are shifting the power back to you. From the capital to the coast, access verified data, real community intel, and a smarter way to find home. Don't just browse—<span className="text-gray-900 dark:text-white font-bold">be part of the change.</span>
            </motion.p>
          </div>

          {/* (Removed the large <img> block here for a cleaner look) */}

          {/* ✅ VALUES GRID: Closer to Hero for continuous flow */}
          <div className="grid md:grid-cols-3 gap-6 text-left mb-12">

            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                To simplify property discovery and ownership through technology, ensuring every client
                finds a place they can proudly call home.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                To become Kenya’s most trusted digital property marketplace by offering
                affordable, transparent, and seamless real estate experiences.
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">Our Values</h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm list-disc pl-4 space-y-1">
                <li>Integrity and transparency</li>
                <li>Customer satisfaction</li>
                <li>Innovation and technology</li>
                <li>Community and sustainability</li>
              </ul>
            </motion.div>
          </div>

          {/* --- FEATURE CTA SECTIONS (Reduced Margins: mt-10 instead of mt-20) --- */}

          {isPlatformCtaEnabled && (
            <motion.div
              className="mt-10 py-12 px-8 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm text-gray-900 dark:text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h4 className="text-2xl font-extrabold mb-3">Our Revolutionary Platform</h4>
              <p className="text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Learn why we built HouseHunt Kenya and how our free model changes the game.
              </p>
              <Link
                to="/our-platform"
                className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-95"
              >
                Discover Our "Why"
              </Link>
            </motion.div>
          )}

          {isAgentCtaEnabled && (
            <motion.div
              className="mt-10 py-12 px-8 bg-blue-600 dark:bg-blue-900 rounded-2xl shadow-lg text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInSlideUp}
            >
              <h4 className="text-2xl font-extrabold mb-3">Are You an Agent?</h4>
              <p className="text-base text-blue-100 max-w-2xl mx-auto mb-6">
                Grow your business, connect with clients, and boost sales—all for free.
              </p>
              <Link
                to="/for-agents"
                className="bg-white text-blue-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition-all duration-150 active:scale-95"
              >
                Learn More
              </Link>
            </motion.div>
          )}

          {/* --- FAQ SECTION --- */}
          <motion.section
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white text-center mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
                Everything you need to know about HouseHunt Kenya
              </p>

              <div className="space-y-4">
                {[
                  {
                    question: "What is HouseHunt Kenya's mission?",
                    answer: "HouseHunt Kenya's mission is to simplify property discovery and ownership through technology, ensuring every client finds a place they can proudly call home. We leverage AI-powered search, verified listings, and community reviews to make property hunting transparent, efficient, and trustworthy."
                  },
                  {
                    question: "What is HouseHunt Kenya's vision?",
                    answer: "Our vision is to become Kenya's most trusted digital property marketplace by offering affordable, transparent, and seamless real estate experiences. We aim to revolutionize property search across Kenya from Nairobi to the coast with innovative technology and community-driven insights."
                  },
                  {
                    question: "What are HouseHunt Kenya's core values?",
                    answer: "HouseHunt Kenya is built on four core values: (1) Integrity and transparency in all transactions, (2) Customer satisfaction as our top priority, (3) Innovation and technology to improve experiences, and (4) Community and sustainability for long-term impact. These principles guide every decision we make."
                  },
                  {
                    question: "When was HouseHunt Kenya founded?",
                    answer: "HouseHunt Kenya was founded in 2025 with the goal of revolutionizing property search in Kenya. We started with a vision to shift power back to property seekers through verified data, real community intelligence, and a smarter way to find home."
                  },
                  {
                    question: "Why did HouseHunt Kenya start?",
                    answer: "HouseHunt Kenya was created to address the challenges in Kenya's property market: fake listings, lack of transparency, hidden fees, and difficulty finding authentic reviews. We built a platform that combines AI-powered search, verified listings, Shadow Buildings community reviews, and integrated services to make property hunting easier and more trustworthy for Kenyans."
                  },
                  {
                    question: "What makes HouseHunt Kenya different from traditional property agencies?",
                    answer: "Unlike traditional agencies, HouseHunt Kenya is a digital-first platform that's free for property seekers, offers AI-powered matching, provides authentic community reviews through Shadow Buildings, includes virtual property tours, has an integrated service directory, and operates 24/7 with property scouts who can access offline listings. We prioritize transparency and technology over commissions."
                  },
                  {
                    question: "How can I contact HouseHunt Kenya?",
                    answer: "You can contact HouseHunt Kenya through multiple channels: WhatsApp support, email at support@househuntkenya.co.ke, or our contact form on the website. We offer 24/7 customer support and our property scouts are always ready to help you find the perfect property."
                  }
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg group"
                  >
                    <summary className="font-bold text-gray-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
                      <span className="text-lg">{faq.question}</span>
                      <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ✅ Final Call to Action (Reduced spacing) */}
          <motion.div
            className="mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInSlideUp}
          >
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Ready to find your home?</h4>
            <Link
              to="/"
              className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-150 active:scale-95"
            >
              Explore Properties
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  );
}