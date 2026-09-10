import React from 'react';

export default function SkillMatchDonut({
  percentage = 70,
  skillsHave = 8,
  skillsToImprove = 5,
  otherSkills = 3,
}) {
  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Skill Match Overview</h3>

      <div className="flex items-center justify-between">
        {/* Radial Chart */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Coral Gap Segment */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#ef4444"
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset="0"
            />
            {/* Green Match Segment */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#10b981"
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-slate-900">{percentage}%</span>
            <span className="text-[10px] font-semibold text-slate-400 -mt-1">Match</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 pl-4 flex-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Skills you have</span>
            </div>
            <span className="font-bold text-slate-900">{skillsHave}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-600 font-medium">Skills to improve</span>
            </div>
            <span className="font-bold text-slate-900">{skillsToImprove}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 font-medium">Other skills</span>
            </div>
            <span className="font-bold text-slate-900">{otherSkills}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
