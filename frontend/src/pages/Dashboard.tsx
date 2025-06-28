import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Extract user name from email or metadata
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-[700px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/src/assets/icons/logo-text.svg" 
              alt="TestCraft AI" 
              className="h-8 mr-6" 
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-teal-800 font-medium hover:text-teal-600">
              Dashboard
            </Link>
            <Link to="/tests" className="text-gray-600 hover:text-teal-800">
              My Tests
            </Link>
            <Link to="/create" className="text-gray-600 hover:text-teal-800">
              Create Test
            </Link>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-teal-800"
            >
              Sign Out
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-teal-800 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden px-4 py-2 pb-4 bg-white">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/dashboard" 
                className="text-teal-800 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/tests" 
                className="text-gray-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                My Tests
              </Link>
              <Link 
                to="/create" 
                className="text-gray-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Test
              </Link>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="text-gray-600 py-2 text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-[700px] mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}!</h1>
          <p className="text-gray-600 mt-1">Here's an overview of your account</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-1">0</h3>
            <p className="text-gray-600">Tests Created</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-1">0</h3>
            <p className="text-gray-600">Active Tests</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-1">0</h3>
            <p className="text-gray-600">Submissions</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/create" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-teal-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New Test</h3>
                <p className="text-sm text-gray-600">Generate AI-powered questions</p>
              </div>
            </Link>
            <Link 
              to="/upload" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Upload Document</h3>
                <p className="text-sm text-gray-600">Import study materials</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Account Information Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account ID</p>
              <p className="font-medium">{user?.id?.substring(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/create" className="inline-block px-4 py-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 transition-colors">
              Create New Test
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
