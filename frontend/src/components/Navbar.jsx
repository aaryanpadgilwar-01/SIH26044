import React from 'react';
import { Briefcase, Home, User, TrendingUp, Bell, ChevronDown, Sparkles, Building2, GraduationCap, School, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentPortal, user, onOpenProfile, onLogout }) {
  const role = user?.role || currentPortal || 'student';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('jobs')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">SkillMatrix</span>
            <p className="text-[11px] text-slate-500 font-medium">One Profile. Endless Opportunities.</p>
          </div>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'home'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'jobs'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            if (onOpenProfile) onOpenProfile();
          }}
          className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'insights'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Insights</span>
        </button>
      </nav>

      {/* Right Controls: Role Display Badge + Notification Bell + User Profile + Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Role Display Badge */}
        {role === 'student' && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Student Portal</span>
          </div>
        )}
        {role === 'industry' && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Industry Portal</span>
          </div>
        )}
        {role === 'institution' && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <School className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Institution Portal</span>
          </div>
        )}

        {/* Bell Icon */}
        <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </div>

        {/* User Avatar Badge */}
        <div
          onClick={onOpenProfile}
          className="flex items-center space-x-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              {role}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Sign out"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
