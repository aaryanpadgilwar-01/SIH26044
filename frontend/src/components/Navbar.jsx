import React from 'react';
import { Briefcase, Home, User, TrendingUp, Bell, ChevronDown, Sparkles, Building2, GraduationCap } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentPortal, setPortal, user, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('jobs')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">SkillMatrix</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 tracking-wider">SIH 2026</span>
            </div>
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
              : 'text-slate-640 hover:text-slate-900 hover:bg-white/60'
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

      {/* Right Controls: Portal Switcher + Notification Bell + User Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Portal Switcher Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setPortal('student')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentPortal === 'student'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setPortal('industry')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentPortal === 'industry'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Industry
          </button>
          <button
            onClick={() => setPortal('institution')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentPortal === 'institution'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Institution
          </button>
        </div>

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
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {user?.name || 'Pavitra S'}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              {currentPortal}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
