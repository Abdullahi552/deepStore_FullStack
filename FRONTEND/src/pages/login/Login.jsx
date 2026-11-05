import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/'); // Go to home page upon successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login to DeepStore</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800" />
          </div>
          <button type="submit" className="w-full py-3 bg-[#1e1c33] text-white text-sm font-medium rounded-lg hover:bg-[#2a2845] transition-colors shadow-sm mt-2">Login</button>
        </form>

        <div className="space-y-4 pt-2">
          <p className="text-center text-xs text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}