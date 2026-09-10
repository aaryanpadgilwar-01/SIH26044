import React from 'react';
import { TrendingUp, MoreHorizontal, BarChart2 } from 'lucide-react';

export default function TopPlatformsCard({ platforms = {} }) {
  const linkedinCount = platforms.LinkedIn || 120;
  const indeedCount = platforms.Indeed || 80;
  const naukriCount = platforms.Naukri || 65;

  return (
    <div className="space-y-4">
      {/* Top Platforms Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Top Platforms</h3>
        <div className="grid grid-cols-4 gap-2">
          {/* LinkedIn */}
          <div className="flex flex-col items-center p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
            <div className="w-8 h-8 rounded-lg bg-[#0077B5] text-white font-bold flex items-center justify-center text-sm shadow-xs mb-1.5">
              in
            </div>
            <span className="text-[11px] font-bold text-slate-800">LinkedIn</span>
            <span className="text-[10px] text-slate-400 font-medium">{linkedinCount} jobs</span>
          </div>

          {/* Indeed */}
          <div className="flex flex-col items-center p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
            <div className="w-8 h-8 rounded-lg bg-[#2164f3] text-white font-bold flex items-center justify-center text-sm shadow-xs mb-1.5 font-serif italic">
              i
            </div>
            <span className="text-[11px] font-bold text-slate-800">Indeed</span>
            <span className="text-[10px] text-slate-400 font-medium">{indeedCount} jobs</span>
          </div>

          {/* Naukri */}
          <div className="flex flex-col items-center p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
            <div className="w-8 h-8 rounded-lg bg-[#004e92] text-white font-extrabold flex items-center justify-center text-sm shadow-xs mb-1.5">
              K
            </div>
            <span className="text-[11px] font-bold text-slate-800">Naukri</span>
            <span className="text-[10px] text-slate-400 font-medium">{naukriCount} jobs</span>
          </div>

          {/* +3 More */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-center">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-1.5">
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-600">+3 more</span>
          </div>
        </div>
      </div>

      {/* Motivational Quote Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="text-xs font-semibold text-slate-700 leading-snug">
          “The right opportunity is a step closer. Keep going!”
        </p>
      </div>
    </div>
  );
}
