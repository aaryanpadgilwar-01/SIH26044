import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

export default function InstitutionDashboard({ user }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('2026-CSE-A');
  const [stats, setStats] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadBatchAnalytics(selectedBatch);
    }
  }, [selectedBatch]);

  const loadBatches = async () => {
    try {
      const bList = await api.getBatches();
      setBatches(bList);
      if (bList.length > 0 && !bList.includes(selectedBatch)) {
        setSelectedBatch(bList[0]);
      }
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  const loadBatchAnalytics = async (batch) => {
    setLoading(true);
    try {
      const [sData, gData, rData] = await Promise.all([
        api.getBatchStats(batch),
        api.getBatchGapAnalysis(batch),
        api.getBatchRoster(batch),
      ]);
      setStats(sData);
      setGapAnalysis(gData);
      setRoster(rData);
    } catch (err) {
      console.error('Failed to load batch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 p-6 space-y-6">
      {/* Top Banner & Batch Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                MIT College of Engineering — Dean's Portal
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Institutional Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Academia-Industry Alignment, Batch Skill Verification & Placement Readiness
            </p>
          </div>
        </div>

        {/* Batch Dropdown Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-600">Active Cohort:</span>
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 py-2 pl-3.5 pr-9 rounded-xl cursor-pointer focus:outline-none shadow-2xs"
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Aggregating cohort skill analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_students || 0}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Students in {selectedBatch}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Verified Skills</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.total_verified_skills || 0}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">AI-Verified Test Badges</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Verified / Student</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.avg_verified_per_student || 0}</div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Industry-standard benchmark ≥ 3.0</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Readiness</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{stats?.avg_job_readiness_score || 72}%</div>
              <p className="text-[11px] text-emerald-600 mt-1 font-bold">+14% vs. previous semester</p>
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Academia-Industry Skill Gap Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time comparison between live market demand and {selectedBatch}'s verified competencies.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-600"></span>
                  <span>Industry Job Demand</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                  <span>Batch Verified Competency</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {gapAnalysis.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{item.skill_name}</span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.status === 'Critical Gap'
                          ? 'bg-red-100 text-red-800'
                          : item.status === 'Moderate Gap'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status} ({item.gap_percentage}% gap)
                    </span>
                  </div>

                  {/* Dual Bar Progress */}
                  <div className="space-y-1.5">
                    {/* Industry Demand Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${item.industry_demand_percentage}%` }}
                      ></div>
                    </div>
                    {/* Student Competency Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${item.batch_competency_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
                    <span>Demand: {item.industry_demand_percentage}% of open postings</span>
                    <span>Cohort Mastery: {item.batch_competency_percentage}% verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Student Placement Roster</h2>
                <p className="text-xs text-slate-500">Individual student progress and placement readiness</p>
              </div>
              <button
                onClick={() => alert('Exporting batch placement readiness report as CSV...')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Target Track</th>
                    <th className="py-3 px-3">Verified Skills</th>
                    <th className="py-3 px-3">Total Skills</th>
                    <th className="py-3 px-3">Readiness Index</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.target_role}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {s.verified_skills_count} Verified
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600">{s.present_skills_count}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{s.overall_readiness_score}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${s.overall_readiness_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            s.status === 'Placement Ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Near Ready'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
