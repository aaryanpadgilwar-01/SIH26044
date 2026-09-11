import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  GraduationCap,
  Building2,
  School,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'industry' | 'institution'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await api.login(email, password);
      } else {
        data = await api.register({
          name,
          email,
          password,
          role,
        });
      }
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoRole) => {
    setError(null);
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);

    try {
      const data = await api.login(demoEmail, 'password123');
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || `Demo login failed for ${demoEmail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center space-x-2 mb-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">SkillMatrix</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            AI-Driven Academia-to-Industry Skill Mapping & Placement Engine
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 mb-4 shadow-xl">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Instant Demo Access</span>
            <span className="text-[10px] text-blue-400 font-medium">Pass: password123</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student@demo.com', 'student')}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-200 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('industry@demo.com', 'industry')}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Industry</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('institution@demo.com', 'institution')}
              className="flex items-center justify-center space-x-1.5 px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              <School className="w-3.5 h-3.5 text-amber-400" />
              <span>Institution</span>
            </button>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Turner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    I am joining as a
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'student'
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-500 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <span className="text-[11px] block">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('industry')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'industry'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-1 ring-indigo-500 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                      <span className="text-[11px] block">Industry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('institution')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        role === 'institution'
                          ? 'border-amber-600 bg-amber-50/70 text-amber-700 ring-1 ring-amber-500 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                      }`}
                    >
                      <School className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      <span className="text-[11px] block">Institution</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Portal' : 'Create & Launch Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-5">
          SkillMatrix • Unified Talent Marketplace & Skill Mapping Engine
        </p>
      </div>
    </div>
  );
}
