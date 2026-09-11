import React, { useState } from 'react';
import { Bookmark, Building2, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import SkillPill from './SkillPill';

// Render recognizable company logo icons or initials
const CompanyLogo = ({ companyName }) => {
  const name = companyName.toLowerCase();
  if (name.includes('google')) {
    return (
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs">
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      </div>
    );
  }
  if (name.includes('microsoft')) {
    return (
      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs">
        <div className="grid grid-cols-2 gap-1 w-6 h-6">
          <div className="bg-[#F25022] rounded-xs"></div>
          <div className="bg-[#7FBA00] rounded-xs"></div>
          <div className="bg-[#00A4EF] rounded-xs"></div>
          <div className="bg-[#FFB900] rounded-xs"></div>
        </div>
      </div>
    );
  }
  if (name.includes('amazon')) {
    return (
      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center text-lg shadow-xs">
        a
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 text-blue-700 font-extrabold flex items-center justify-center text-lg shadow-xs">
      {companyName.charAt(0)}
    </div>
  );
};

export default function JobCard({ job, isSaved = false, onToggleSave, onApply, onViewDetails, onTestSkill }) {
  const [applying, setApplying] = useState(false);

  const score = job.match_score || 70;
  // Match badge styling
  let badgeClasses = 'bg-[#dcfce7] text-[#15803d] border-emerald-200';
  if (score < 50) {
    badgeClasses = 'bg-[#fee2e2] text-[#b91c1c] border-red-200';
  } else if (score < 70) {
    badgeClasses = 'bg-[#fef3c7] text-[#b45309] border-amber-200';
  }

  const handleApplyClick = async (e) => {
    e.stopPropagation();
    if (job.has_applied) return;
    setApplying(true);
    try {
      if (onApply) await onApply(job.id);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all">
      {/* Top Row: Logo, Title, Time, Bookmark, Match Badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3.5">
          <CompanyLogo companyName={job.company_name} />
          <div>
            <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors" onClick={() => onViewDetails(job)}>
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium mt-1">
              <span className="font-semibold text-slate-700">{job.company_name}</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.job_type}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Match Badge & Bookmark */}
        <div className="flex items-center space-x-2.5">
          <span className="text-xs text-slate-400 hidden sm:inline">2 days ago</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSave) onToggleSave(job);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from Saved Jobs' : 'Save Job'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
          </button>
          <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${badgeClasses}`}>
            {score}% Match
          </div>
        </div>
      </div>

      {/* Skill Pills Row (Technical/Hard Skills Only) */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {job.skills &&
          job.skills
            .filter(
              (skill) =>
                skill.category !== 'Soft Skills' &&
                !['Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Critical Thinking'].includes(skill.name)
            )
            .map((skill, index) => (
              <SkillPill
                key={index}
                name={skill.name}
                status={skill.status}
                isPresent={skill.is_present}
                onClick={() => onTestSkill && onTestSkill(skill)}
              />
            ))}
      </div>

      {/* Description Excerpt */}
      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Bottom Footer: View Details & Quick Apply */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          via {job.platform || 'LinkedIn'}
        </span>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onViewDetails(job)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center space-x-1 group"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleApplyClick}
            disabled={job.has_applied || applying}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all ${
              job.has_applied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            {job.has_applied ? (
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Applied</span>
              </span>
            ) : applying ? (
              'Applying...'
            ) : (
              'Quick Apply'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
