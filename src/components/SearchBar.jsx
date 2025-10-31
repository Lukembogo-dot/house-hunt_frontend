import { useState } from "react";

export default function SearchBar({ onFilter }) {
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow p-4 rounded-lg flex flex-wrap gap-4 justify-center items-end"
    >
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="e.g. Nairobi"
          className="border rounded p-2 w-48"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className="border rounded p-2 w-40"
        >
          <option value="">All</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Land">Land</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="10000"
          className="border rounded p-2 w-32"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="1000000"
          className="border rounded p-2 w-32"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
