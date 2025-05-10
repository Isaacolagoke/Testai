import React from 'react';

// This component uses various Tailwind CSS classes from our configuration
// to verify that the setup is working correctly
const TestTailwind = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-vertical-lg">
      <div className="container mx-auto bg-background min-h-screen py-8 shadow-lg rounded-2xl">
        <header className="sticky top-0 z-10 bg-background border-b border-gray-light py-4 px-horizontal-lg">
          <h1 className="text-primary font-bold text-heading">Tailwind v4 Test</h1>
        </header>
        
        <main className="p-horizontal-lg">
          <h2 className="text-secondary font-bold text-section mt-8 mb-4">
            Design System Components
          </h2>
          
          {/* Testing typography */}
          <section className="mb-8 p-question rounded border border-gray-light">
            <h3 className="font-bold mb-4">Typography</h3>
            <p className="text-body text-gray mb-3">This is body text in the secondary color</p>
            <p className="text-section font-medium mb-3">This is section text with medium weight</p>
            <p className="text-heading font-bold">This is heading text with bold weight</p>
          </section>
          
          {/* Testing colors */}
          <section className="mb-8 p-question rounded border border-gray-light">
            <h3 className="font-bold mb-4">Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary text-white p-4 rounded">Primary Color</div>
              <div className="bg-primary-hover text-primary p-4 rounded">Primary Hover</div>
              <div className="bg-secondary text-white p-4 rounded">Secondary Color</div>
              <div className="bg-gray p-4 rounded text-white">Gray</div>
              <div className="bg-gray-light p-4 rounded">Gray Light</div>
            </div>
          </section>
          
          {/* Testing buttons */}
          <section className="mb-8 p-question rounded border border-gray-light">
            <h3 className="font-bold mb-4">Buttons</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="bg-primary text-white h-button px-4 rounded hover:bg-primary-hover">
                Primary Button
              </button>
              <button className="bg-white border border-gray-light text-primary h-button px-4 rounded hover:bg-gray-light">
                Secondary Button
              </button>
            </div>
          </section>
          
          {/* Testing form elements */}
          <section className="mb-8 p-question rounded border border-gray-light">
            <h3 className="font-bold mb-4">Form Elements</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Input Field</label>
                <input 
                  type="text" 
                  className="h-input p-input w-full border border-gray-light rounded focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Enter text here"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-5 w-5 border-gray-light rounded checked:bg-primary" />
                  <span className="ml-2">Checkbox option</span>
                </label>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TestTailwind;
