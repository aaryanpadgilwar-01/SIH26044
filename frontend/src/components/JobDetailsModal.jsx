import React, { useState } from 'react';
import { X, MapPin, Building2, Clock, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import SkillPill from './SkillPill';

export default function JobDetailsModal({ isOpen, onClose, job, onApply, onTestSkill }) {
  const [applying, setApplying] = useState(false);

  if (!isOpen || !job) return null;

  const handleApply = async () => {
    if (job.has_applied) return;
    setApplying(true);
    try {
      if (onApply) await onApply(job.id);
    } finally {
      setApplying(false);
    }
  };

  const score = job.match_score || 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Job Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900">{job.title}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                via {job.platform || 'LinkedIn'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium mt-1.5">
              <span className="font-bold text-slate-800">{job.company_name}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.job_type}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-extrabold bg-[#dcfce7] text-[#15803d]">
              <span>{score}% Match</span>
            </div>
          </div>
        </div>

        {/* Skill Match Breakdown */}
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
            Role Skill Alignment
          </h4>
          <div className="flex flex-wrap gap-1.5">
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
                    onClick={() => {
                      onClose();
                      if (onTestSkill) onTestSkill(skill);
                    }}
                  />
                ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tip: Click any missing skill pill in red to launch an instant AI skill test.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1.5">Job Overview</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <button
            onClick={handleApply}
            disabled={job.has_applied || applying}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2 ${
              job.has_applied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {job.has_applied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Application Submitted</span>
              </>
            ) : applying ? (
              <span>Submitting application...</span>
            ) : (
              <>
                <span>Apply with SkillMatrix Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
