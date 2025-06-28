import { Routes, Route, Navigate, Link } from 'react-router-dom';
import TestTailwind from './TestTailwind';
import { AuthProvider } from './contexts/AuthContext';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

// Simple Home component
const Home = () => (
  <div className="container mx-auto p-6 bg-white rounded-2xl shadow-md">
    <h1 className="text-2xl font-bold mb-4 text-teal-800">Testcraft AI</h1>
    <p className="text-gray-700 mb-6">An EdTech platform for creating AI-powered tests and assessments.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Tutor Interface</h2>
        <p className="mb-4 text-gray-700">Create and manage tests with AI-generated questions.</p>
        <Link to="/signup" className="bg-teal-800 text-white px-4 py-2 rounded-lg hover:bg-teal-700 inline-block">
          Get Started
        </Link>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-3 text-gray-900">Learner Interface</h2>
        <p className="mb-4 text-gray-700">Access and complete assessments with a simple code.</p>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Enter Code
        </button>
      </div>
    </div>
    
    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold mb-3 text-gray-900">Test Tailwind CSS</h2>
      <p className="mb-4 text-gray-700">Click the button below to view the Tailwind CSS test page.</p>
      <Link to="/test-tailwind" className="bg-teal-800 text-white px-4 py-2 inline-block rounded-lg hover:bg-teal-700">
        View Test Page
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[700px] mx-auto bg-white min-h-screen">
          <Routes>
            {/* Auth Routes (these don't use the main layout) */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/test-tailwind" element={<TestTailwind />} />
            
            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add more private routes here */}
            </Route>
            
            {/* Redirect to login for undefined routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
