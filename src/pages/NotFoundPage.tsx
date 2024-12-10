// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
// import Header from '../components/Header';

const NotFoundPage = () => (
  <div>
    {/*<Header />*/}
    <div className="max-w-4xl mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Return Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;