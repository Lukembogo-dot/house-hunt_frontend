import React, { useState, useEffect } from 'react';
import { useFeatureFlag } from '../context/FeatureFlagContext';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaEnvelope, FaSpinner } from 'react-icons/fa';

// A simple, self-contained SEO component for this page
const SeoInjector = ({ seo }) => {
  return (
    <Helmet>
      <title>{seo.metaTitle}</title>
      <meta name="description" content={seo.metaDescription} />
      {/* Add other meta tags if needed, like Open Graph */}
      <meta property="og:title" content={seo.metaTitle} />
      <meta property="og:description" content={seo.metaDescription} />
    </Helmet>
  );
};

// Define our quiz questions
const quizQuestions = [
  {
    step: 1,
    question: "What's your preferred vibe?",
    key: 'vibe',
    options: [
      { text: 'Quiet & Family-Friendly', value: 'quiet' },
      { text: 'Modern & Full of Nightlife', value: 'nightlife' },
      { text: 'Green & Suburban', value: 'suburban' },
      { text: 'Close to the City Center', value: 'central' },
    ],
  },
  {
    step: 2,
    question: 'What is your monthly budget (for rent)?',
    key: 'budget',
    options: [
      { text: 'Under KES 50,000', value: 'low' },
      { text: 'KES 50,000 - 100,000', value: 'medium' },
      { text: 'KES 100,000 - 150,000', value: 'high' },
      { text: 'Over KES 150,000', value: 'luxury' },
    ],
  },
  {
    step: 3,
    question: 'How many bedrooms do you need?',
    key: 'bedrooms',
    options: [
      { text: 'Studio / 1 Bedroom', value: '1' },
      { text: '2 Bedrooms', value: '2' },
      { text: '3 Bedrooms', value: '3' },
      { text: '4+ Bedrooms', value: '4' },
    ],
  },
];

export default function NeighbourhoodQuiz() {
  // --- 1. FEATURE FLAG CHECK ---
  const isQuizEnabled = useFeatureFlag('neighbourhood-quiz');

  // --- 2. SEO STATE & FETCH ---
  const [seo, setSeo] = useState({
    metaTitle: 'Find Your Perfect Neighbourhood | HouseHunt',
    metaDescription: 'Take our simple quiz to discover the best Nairobi neighbourhood for your lifestyle and budget.',
  });

  useEffect(() => {
    // This path must match the one we'll add in App.jsx
    const pagePath = '/find-my-neighbourhood';

    const fetchSeoData = async () => {
      try {
        const encodedPath = encodeURIComponent(pagePath);
        const { data } = await apiClient.get(`/seo/${encodedPath}`);

        // If data is found, set it. Otherwise, the defaults will be used.
        setSeo({
          metaTitle: data.metaTitle || seo.metaTitle,
          metaDescription: data.metaDescription || seo.metaDescription,
        });
      } catch (error) {
        console.warn(`No SEO data found for ${pagePath}. Using defaults.`);
        // In case of error, we just keep the default SEO values
      }
    };

    if (isQuizEnabled) {
      fetchSeoData();
    }
  }, [isQuizEnabled]); // Depend on the flag

  // --- 3. QUIZ STATE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const totalSteps = quizQuestions.length;
  const currentQuestion = quizQuestions.find(q => q.step === currentStep);

  const handleAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Automatically go to next step
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question answered, calculate results
      calculateResults({ ...answers, [key]: value });
    }
  };

  const calculateResults = (finalAnswers) => {
    // --- This is a MOCK algorithm. We can make this complex later ---
    let recommendations = [];
    if (finalAnswers.vibe === 'nightlife' && finalAnswers.budget === 'medium') {
      recommendations = ['Kilimani', 'Kileleshwa'];
    } else if (finalAnswers.vibe === 'quiet' && finalAnswers.budget === 'luxury') {
      recommendations = ['Karen', 'Runda'];
    } else if (finalAnswers.vibe === 'suburban' && finalAnswers.budget === 'high') {
      recommendations = ['Lavington', 'Gigiri'];
    } else if (finalAnswers.vibe === 'central') {
      recommendations = ['Westlands', 'Nairobi CBD'];
    } else {
      recommendations = ['Kilimani', 'Lavington', 'Westlands']; // Default
    }
    setResults(recommendations);
    setCurrentStep(currentStep + 1); // Move to results screen
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Connect this to a real backend endpoint
    console.log('Submitting lead:', { email, preferences: answers, results });

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setMessage('Success! We will alert you when matching properties are listed.');
    }, 1500);
  };

  const restartQuiz = () => {
    setAnswers({});
    setResults(null);
    setCurrentStep(1);
    setEmail('');
    setMessage('');
  };

  // --- 4. REDIRECT IF FLAG IS OFF ---
  if (!isQuizEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SeoInjector seo={seo} />
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4">
        <motion.div
          className="w-full max-w-2xl"
          key={currentStep} // This makes Framer Motion re-animate on step change
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
            <AnimatePresence mode="wait">
              {/* --- 5. RENDER CURRENT STEP OR RESULTS --- */}
              {currentStep <= totalSteps && currentQuestion ? (
                // --- QUIZ QUESTIONS ---
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <div className="mb-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Step {currentStep} of {totalSteps}
                  </div>
                  <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
                    {currentQuestion.question}
                  </h1>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {currentQuestion.options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(currentQuestion.key, option.value)}
                        className="block w-full rounded-lg border border-gray-300 p-6 text-left text-lg font-medium text-gray-700 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md dark:border-gray-600 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:bg-gray-700"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                  {currentStep > 1 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="mt-8 flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                    >
                      <FaArrowLeft />
                      <span>Back</span>
                    </button>
                  )}
                </motion.div>
              ) : (
                // --- RESULTS SCREEN ---
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                >
                  <h1 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    Your Perfect Match!
                  </h1>
                  <p className="mb-6 text-center text-lg text-gray-600 dark:text-gray-300">
                    Based on your answers, we recommend these neighbourhoods:
                  </p>
                  <div className="mb-8 flex flex-wrap justify-center gap-4">
                    {results && results.map(hood => (
                      <span
                        key={hood}
                        className="rounded-full bg-blue-100 px-6 py-3 text-xl font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {hood}
                      </span>
                    ))}
                  </div>

                  <div className="mt-10 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-gray-800">
                    <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                      Get Notified!
                    </h3>
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      Be the first to know when new properties that match your quiz results are listed.
                    </p>
                    {message ? (
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">{message}</p>
                    ) : (
                      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-grow">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FaEnvelope className="text-gray-400" />
                          </span>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-md border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            'Alert Me'
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  <button
                    onClick={restartQuiz}
                    className="mt-8 flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                  >
                    <FaArrowLeft />
                    <span>Start Over</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}