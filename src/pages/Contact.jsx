import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-lg dark:border dark:border-gray-700 rounded-2xl p-10">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
          Get in Touch
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-10">
          Have questions, feedback, or partnership inquiries? Fill out the form below and our team will get back to you promptly.
        </p>

        {/* Contact Form */}
        <form className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              rows="5"
              placeholder="Write your message here..."
              className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition duration-300"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Email</h3>
            <p className="text-gray-600 dark:text-gray-300">support@househunt.co.ke</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Phone</h3>
            <p className="text-gray-600 dark:text-gray-300">+254 717 109 971</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;