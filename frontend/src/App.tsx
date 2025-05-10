import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import TestTailwind from './TestTailwind';

// Placeholder pages - these will be created later
const Home = () => <div className="container mx-auto p-6 bg-white rounded-2xl shadow-md">
  <h1 className="text-heading font-bold text-primary mb-4">Testcraft AI</h1>
  <p className="text-secondary mb-6">An EdTech platform for creating AI-powered tests and assessments.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-slate-50 p-6 rounded-xl border border-gray-light">
      <h2 className="text-section font-bold mb-3">Tutor Interface</h2>
      <p className="mb-4 text-body">Create and manage tests with AI-generated questions.</p>
      <button className="bg-primary text-white h-button px-4 rounded hover:bg-primary-hover">
        Get Started
      </button>
    </div>
    <div className="bg-slate-50 p-6 rounded-xl border border-gray-light">
      <h2 className="text-section font-bold mb-3">Learner Interface</h2>
      <p className="mb-4 text-body">Access and complete assessments with a simple code.</p>
      <button className="bg-secondary text-white h-button px-4 rounded hover:bg-primary-hover">
        Enter Code
      </button>
    </div>
  </div>
  
  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-gray-light">
    <h2 className="text-section font-bold mb-3">Test Tailwind CSS v4</h2>
    <p className="mb-4 text-body">Click the button below to view the Tailwind CSS v4 test page.</p>
    <Link to="/test-tailwind" className="bg-primary text-white h-button px-4 py-2 inline-block rounded hover:bg-primary-hover">
      View Test Page
    </Link>
  </div>
</div>;

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[700px] mx-auto bg-background min-h-screen pb-10">
        <header className="sticky top-0 z-10 bg-background border-b border-gray-light py-4 px-horizontal-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-section font-bold text-primary">Testcraft AI</h1>
            <nav className="flex gap-4">
              <Link to="/" className="text-primary hover:text-primary-hover">
                Home
              </Link>
              <Link to="/test-tailwind" className="text-primary hover:text-primary-hover">
                Test Tailwind
              </Link>
              <button className="text-primary hover:text-primary-hover">
                Login
              </button>
            </nav>
          </div>
        </header>

        <main className="pt-vertical px-horizontal-lg">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test-tailwind" element={<TestTailwind />} />
            {/* More routes will be added here */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
