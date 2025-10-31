import React from "react";

export default function About() {
  return (
    <section className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-4xl font-bold text-blue-600 mb-6">About HouseHunt Kenya</h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-12">
          HouseHunt Kenya is your trusted real estate partner dedicated to helping you find your dream home 
          — whether you’re buying, renting, or investing. We combine innovation, transparency, and local 
          expertise to make property hunting simple and enjoyable.
        </p>

        {/* Image or Banner */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-12">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
            alt="About HouseHunt Kenya"
            className="w-full h-[400px] object-cover"
          />
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-blue-600 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To simplify property discovery and ownership through technology, ensuring every client 
              finds a place they can proudly call home.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-blue-600 mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To become Kenya’s most trusted digital property marketplace by offering 
              affordable, transparent, and seamless real estate experiences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold text-blue-600 mb-3">Our Values</h3>
            <ul className="text-gray-600 list-disc pl-5 space-y-2">
              <li>Integrity and transparency</li>
              <li>Customer satisfaction</li>
              <li>Innovation and technology</li>
              <li>Community and sustainability</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <h4 className="text-2xl font-semibold text-gray-800 mb-4">Join Thousands of Happy Home Seekers</h4>
          <p className="text-gray-600 mb-6">
            Whether you’re looking to rent, buy, or sell, HouseHunt Kenya is here to guide you every step of the way.
          </p>
          <a
            href="#"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Explore Properties
          </a>
        </div>
      </div>
    </section>
  );
}

