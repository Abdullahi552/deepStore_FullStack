import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const { register, isEmailTaken } = useAuth();
  const navigate = useNavigate(); // React Router's navigation hook

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) return setEmailError('');
    setEmailError(isEmailTaken(value) ? 'Email is already registered' : '');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length > 0 && value.length < 8 ? 'Password must be at least 8 characters' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isEmailTaken(email)) return setFormError('Email already in use.');
    if (password.length < 8) return setPasswordError('Password must be at least 8 characters');

    try {
      await register(fullName, email, password);
      navigate('/login'); // Send user to login page after successful registration
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1">Join DeepStore today and start shopping</p>
        </div>

        {formError && (
          <div className="mb-4 p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-100 text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
            <input placeholder='example@gmail.com' type="email" required value={email} onChange={handleEmailChange} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
            {emailError && <p className="text-[11px] text-red-500 mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={handlePasswordChange} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
            {passwordError && <p className="text-[11px] text-red-500 mt-1">{passwordError}</p>}
          </div>
          <button type="submit" className="w-full py-3 bg-[#1e1c33] text-white text-sm font-medium rounded-lg hover:bg-[#2a2845] transition-colors shadow-sm mt-2">Sign Up</button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}