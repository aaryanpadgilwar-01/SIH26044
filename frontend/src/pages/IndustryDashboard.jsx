import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Users,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Send,
  Eye,
  MapPin,
} from 'lucide-react';
import { api } from '../services/api';
import SkillPill from '../components/SkillPill';

export default function IndustryDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'post-job', 'candidates'
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    location: 'Bengaluru, India',
    job_type: 'Full-time',
    description: '',
    platform: 'SkillMatrix',
    skills: 'Python, SQL, Data Structures, FastAPI, System Design',
  });
  const [postingSuccess, setPostingSuccess] = useState(false);

  useEffect(() => {
    loadIndustryData();
  }, []);

  const loadIndustryData = async () => {
    setLoading(true);
    try {
      const [compData, jobsData] = await Promise.all([
        api.getCompanyProfile(),
        api.getCompanyJobs(),
      ]);
      setCompany(compData);
      setJobs(jobsData);
      if (jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
        loadCandidates(jobsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load industry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId) => {
    setLoadingCandidates(true);
    try {
      const candData = await api.getJobCandidates(jobId);
      setCandidates(candData);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    loadCandidates(jobId);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
      await api.postJob({
        title: jobForm.title,
        location: jobForm.location,
        job_type: jobForm.job_type,
        description: jobForm.description,
        platform: jobForm.platform,
        skills: skillsArray,
      });
      setPostingSuccess(true);
      setTimeout(() => setPostingSuccess(false), 3000);
      setJobForm({
        title: '',
        location: 'Bengaluru, India',
        job_type: 'Full-time',
        description: '',
        platform: 'SkillMatrix',
        skills: '',
      });
      // Refresh jobs list
      const updatedJobs = await api.getCompanyJobs();
      setJobs(updatedJobs);
      setActiveTab('pipeline');
    } catch (err) {
      alert(err.message || 'Failed to post job');
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    if (!appId) return;
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setCandidates((prev) =>
        prev.map((c) =>
          c.application_id === appId ? { ...c, application_status: newStatus } : c
        )
      );
    } catch (err) {
      alert('Status update failed');
    }
  };

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="flex-1 min-w-0 p-6 space-y-6">
      {/* Top Company Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
            {company?.name ? company.name.charAt(0) : 'G'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {company?.name || 'Google Employer Portal'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Recruiter
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {company?.location || 'Bengaluru, India'} • AI-Powered Talent Sourcing & Reverse Skill Matching
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'pipeline'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Candidate Pipeline
          </button>
          <button
            onClick={() => setActiveTab('post-job')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'post-job'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {activeTab === 'post-job' ? (
        /* Post New Job Form */
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Post a New Opening</h2>
          <p className="text-xs text-slate-500 mb-5">
            Our engine will automatically vectorize skills and rank verified candidates.
          </p>

          {postingSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Job posted successfully! Redirecting to pipeline...</span>
            </div>
          )}

          <form onSubmit={handlePostJob} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                <select
                  value={jobForm.job_type}
                  onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                required
                placeholder="Python, SQL, System Design, Docker, AWS"
                value={jobForm.skills}
                onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
              <textarea
                rows={4}
                required
                placeholder="Describe key responsibilities and technical expectations..."
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Publish Job & Match Candidates
            </button>
          </form>
        </div>
      ) : (
        /* Candidate Pipeline View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: List of Jobs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Active Job Postings ({jobs.length})
            </h3>
            <div className="space-y-2">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <div
                    key={job.id}
                    onClick={() => handleSelectJob(job.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {job.applicant_count || 0} applied
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{job.location}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {job.skills &&
                        job.skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Ranked Matched Candidates */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Ranked Candidates for {activeJob?.title || 'Selected Role'}
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by bidirectional cosine skill similarity + verified assessments
                </p>
              </div>
            </div>

            {loadingCandidates ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Calculating talent vector scores...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-xs font-semibold text-slate-600">No candidates found for this role.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((cand) => {
                  const score = cand.match_score;
                  let badgeColor = 'bg-[#dcfce7] text-[#15803d] border-emerald-200';
                  if (score < 50) badgeColor = 'bg-[#fee2e2] text-[#b91c1c] border-red-200';
                  else if (score < 70) badgeColor = 'bg-[#fef3c7] text-[#b45309] border-amber-200';

                  return (
                    <div
                      key={cand.user_id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
                            {cand.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900">{cand.name}</h4>
                              {cand.verified_skills_count > 0 && (
                                <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{cand.verified_skills_count} Verified</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{cand.headline}</p>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${badgeColor}`}>
                          {score}% Match
                        </div>
                      </div>

                      {/* Skill Breakdown */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Matched:</span>
                        {cand.present_skills.map((s, i) => (
                          <SkillPill key={i} name={s} status="present" size="sm" />
                        ))}
                        {cand.missing_skills.length > 0 && (
                          <>
                            <span className="text-[11px] font-bold text-slate-400 mx-1">Gap:</span>
                            {cand.missing_skills.map((s, i) => (
                              <SkillPill key={i} name={s} status="suggested" size="sm" />
                            ))}
                          </>
                        )}
                      </div>

                      {/* Application status controls */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Status:{' '}
                          <span className="font-bold text-slate-800 capitalize">
                            {cand.application_status || (cand.has_applied ? 'applied' : 'talent pool')}
                          </span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(cand.application_id, 'shortlisted')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(cand.application_id, 'rejected')}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            Pass
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
