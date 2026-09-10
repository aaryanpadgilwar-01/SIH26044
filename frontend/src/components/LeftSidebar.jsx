import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  BarChart3,
  UserCheck,
  Sprout,
  ArrowRight,
} from 'lucide-react';

export default function LeftSidebar({ activeSection, setActiveSection, onOpenCVModal }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse-jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark },
    { id: 'skill-insights', label: 'Skill Insights', icon: BarChart3 },
    { id: 'profile-cv', label: 'Profile & CV', icon: UserCheck },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between py-6 px-4">
      {/* Navigation Links */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-blue-600' : 'text-slate-500'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Keep Growing Nudge Card */}
      <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-bold text-sm text-slate-800">Keep Growing!</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          You're 70% match on average for your target jobs. Upskill and unlock more opportunities!
        </p>
        <button
          onClick={() => setActiveSection('skill-insights')}
          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>View Recommendations</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </aside>
  );
}
