export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">🏠 HouseHunter</h1>
      <ul className="flex space-x-6">
        <li className="hover:text-blue-600 cursor-pointer">Home</li>
        <li className="hover:text-blue-600 cursor-pointer">Buy</li>
        <li className="hover:text-blue-600 cursor-pointer">Rent</li>
        <li className="hover:text-blue-600 cursor-pointer">Favorites</li>
        <li className="hover:text-blue-600 cursor-pointer">Contact</li>
      </ul>
    </nav>
  );
}
Navbar.jsx