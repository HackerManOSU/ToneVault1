import { Link } from 'react-router-dom';

const Header = () => (
  <header className="flex bg-gray-800 text-white py-4 h-[10vh]">
    <div className="max-w-7xl mx-auto px-4 flex justify-between items-center w-full">
      <Link to="/home" className="text-2xl font-bold">Tone Vault</Link>
      <nav>
        <Link to="/profile" className="text-white hover:text-gray-300 ml-4">Profile</Link>
      </nav>
    </div>
  </header>
);

export default Header;