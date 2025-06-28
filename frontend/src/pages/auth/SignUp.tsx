import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type FieldError = {
  name: string | null;
  email: string | null;
  password: string | null;
};

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    name: null,
    email: null,
    password: null
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Calculate password strength when password changes
    if (formData.password) {
      let strength = 0;
      // Length check
      if (formData.password.length >= 8) strength += 1;
      // Contains uppercase
      if (/[A-Z]/.test(formData.password)) strength += 1;
      // Contains lowercase
      if (/[a-z]/.test(formData.password)) strength += 1;
      // Contains number
      if (/[0-9]/.test(formData.password)) strength += 1;
      // Contains special character
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      
      setPasswordStrength(strength);
      
      // Set password error message based on strength
      if (formData.password.length > 0 && formData.password.length < 6) {
        setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      } else if (strength < 3 && formData.password.length >= 6) {
        setFieldErrors(prev => ({ ...prev, password: 'Password is weak, add numbers or special characters' }));
      } else {
        setFieldErrors(prev => ({ ...prev, password: null }));
      }
    }
  }, [formData.password]);

  const validateEmail = (email: string): boolean => {
    // More permissive email regex that accepts most email formats
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) || email.includes('@'); // Accept anything with @ for client-side validation
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors on change
    setFieldErrors(prev => ({
      ...prev,
      [name]: null
    }));
    
    // Validate email on change
    if (name === 'email' && value && !validateEmail(value)) {
      setFieldErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldError = {
      name: null,
      email: null,
      password: null
    };
    
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { success, error } = await signUp(formData.email, formData.password, formData.name);
      
      if (success) {
        navigate('/dashboard');
      } else {
        // Handle specific Supabase errors
        const errorMsg = error || 'Failed to create account';
        if (errorMsg.includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: errorMsg }));
        } else if (errorMsg.includes('password')) {
          setFieldErrors(prev => ({ ...prev, password: errorMsg }));
        } else {
          // General error
          setFieldErrors(prev => ({ 
            ...prev, 
            email: errorMsg
          }));
        }
      }
    } catch (err) {
      setFieldErrors(prev => ({ 
        ...prev, 
        email: 'An unexpected error occurred'
      }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/src/assets/icons/logo-text.svg" 
          alt="TestCraft AI" 
          className="h-8"
        />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-2">Create your account</h1>
        <p className="text-center text-gray-600 mb-8">Harness the power of AI to create faster tests</p>

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name && (
              <div className="mt-2 mb-3 flex items-center text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fieldErrors.name}</span>
              </div>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <div className="mt-2 mb-3 flex items-center text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-lg border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="mt-2 mb-3 flex items-center text-red-600 text-sm">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fieldErrors.password}</span>
              </div>
            )}
            {formData.password && !fieldErrors.password && (
              <div className="mt-1">
                <div className="w-full h-1 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength < 3 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength < 3 ? 'Weak password' : passwordStrength < 4 ? 'Good password' : 'Strong password'}
                </p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-800 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-300"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        {/* Already have an account */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? 
            <Link to="/login" className="text-teal-800 ml-1 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center mt-8 mb-8">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-600">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Social Logins */}
        <div className="space-y-4">
          {/* Google Login */}
          <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            <span>Continue with Google</span>
          </button>

          {/* Apple Login */}
          <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.0423 11.9345C17.0186 9.16652 19.3243 7.79319 19.4262 7.72585C18.1944 5.88465 16.2524 5.59759 15.5732 5.57625C13.9633 5.41465 12.4024 6.50625 11.5835 6.50625C10.7445 6.50625 9.48345 5.59332 8.12912 5.62305C6.37185 5.65172 4.74892 6.63839 3.86838 8.19039C2.05925 11.3434 3.39718 16.0084 5.12858 18.7284C5.98632 20.0538 6.98172 21.5411 8.29045 21.4827C9.5617 21.4201 10.0368 20.6584 11.5717 20.6584C13.0867 20.6584 13.5361 21.4827 14.8673 21.4434C16.2433 21.4201 17.0956 20.1147 17.9178 18.7766C18.8893 17.2466 19.2875 15.7412 19.3083 15.6637C19.2669 15.6473 17.0701 14.8169 17.0423 11.9345Z" fill="black" />
              <path d="M14.5923 3.91558C15.3096 2.9919 15.7999 1.75111 15.6665 0.5C14.6088 0.549583 13.3372 1.20998 12.5895 2.11058C11.9253 2.9099 11.3415 4.19377 11.4957 5.40131C12.6743 5.49245 13.8541 4.82131 14.5923 3.91558Z" fill="black" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
