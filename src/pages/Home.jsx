import Navbar from "../components/Navbar";
import PropertyList from "../components/PropertyList";

export default function Home() {
  return (
    <div>
      <Navbar />
      <header className="bg-blue-50 text-center py-20">
        <h1 className="text-4xl font-bold text-blue-700">
          Find Your Dream Home
        </h1>
        <p className="text-gray-600 mt-3">
          Explore thousands of properties for sale and rent in Kenya.
        </p>
      </header>
      <PropertyList />
    </div>
  );
}