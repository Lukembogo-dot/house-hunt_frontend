// src/pages/HomePage.jsx
import PropertyList from "../components/PropertyList";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[70vh] flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Find Your Dream Home
          </h1>
          <p className="text-lg md:text-2xl mb-6 max-w-2xl mx-auto">
            Discover affordable rentals, family homes, and luxurious apartments — all in one place.
          </p>
          <a
            href="#properties"
            className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 px-8 rounded-full font-semibold"
          >
            Browse Listings
          </a>
        </div>
      </section>

      {/* Property Listings */}
      <section id="properties" className="py-16 px-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
          Featured Properties
        </h2>
        <PropertyList />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">
              HouseHunter
            </h3>
            <p>Your trusted platform for finding the perfect home across Kenya.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Contact</h3>
            <p>Email: support@househunter.co.ke</p>
            <p>Phone: +254 700 123 456</p>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-8 text-sm">
          © {new Date().getFullYear()} HouseHunter. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
