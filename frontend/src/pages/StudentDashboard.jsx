import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  ArrowRight,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import SkillPill from '../components/SkillPill';
import SkillMatchDonut from '../components/SkillMatchDonut';
import CVUploadModal from '../components/CVUploadModal';
import SkillTestModal from '../components/SkillTestModal';
import JobDetailsModal from '../components/JobDetailsModal';

export default function StudentDashboard({ user, activeSection = 'dashboard', setActiveSection }) {
  const [summary, setSummary] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [jobTypeFilter, setJobTypeFilter] = useState('All Job Types');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [sortBy, setSortBy] = useState('Most Relevant');

  // Modal states
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [testSkill, setTestSkill] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sumData, jobsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecommendedJobs({
          query: searchQuery,
          location: locationFilter,
          job_type: jobTypeFilter,
          platform: platformFilter,
        }),
      ]);
      setSummary(sumData);
      setJobs(jobsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (job) => {
    setSavedJobIds((prev) =>
      prev.includes(job.id) ? prev.filter((id) => id !== job.id) : [...prev, job.id]
    );
  };

  const handleFilterChange = async (type, value) => {
    let loc = locationFilter;
    let jt = jobTypeFilter;
    let pf = platformFilter;
    let q = searchQuery;

    if (type === 'location') {
      loc = value;
      setLocationFilter(value);
    } else if (type === 'job_type') {
      jt = value;
      setJobTypeFilter(value);
    } else if (type === 'platform') {
      pf = value;
      setPlatformFilter(value);
    } else if (type === 'query') {
      q = value;
      setSearchQuery(value);
    }

    try {
      const jobsData = await api.getRecommendedJobs({
        query: q,
        location: loc,
        job_type: jt,
        platform: pf,
      });
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to filter jobs:', err);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await api.applyToJob(jobId);
      // Update local job state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, has_applied: true } : j))
      );
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, has_applied: true }));
      }
    } catch (err) {
      alert(err.message || 'Application failed');
    }
  };

  const handleCVUploadSuccess = () => {
    loadDashboardData();
  };

  const handleTestCompleted = () => {
    loadDashboardData();
  };

  // Extract technical skills only for the right panel (Soft skills excluded for this phase)
  const allSkills = (summary?.skills || [
    { name: 'Python', status: 'verified', category: 'Programming Languages' },
    { name: 'Java', status: 'present', category: 'Programming Languages' },
    { name: 'SQL', status: 'verified', category: 'Databases' },
    { name: 'Data Structures', status: 'present', category: 'Core CS' },
    { name: 'Algorithms', status: 'present', category: 'Core CS' },
    { name: 'System Design', status: 'suggested', category: 'Core CS' },
    { name: 'Cloud (AWS/GCP)', status: 'suggested', category: 'Cloud & DevOps' },
    { name: 'Linux', status: 'present', category: 'Tools & OS' },
    { name: 'Docker', status: 'suggested', category: 'Cloud & DevOps' },
    { name: 'Machine Learning', status: 'suggested', category: 'AI/ML' },
    { name: 'Git', status: 'present', category: 'Tools & OS' },
  ]).filter(
    (s) =>
      s.category !== 'Soft Skills' &&
      !['Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Critical Thinking'].includes(s.name)
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-6 p-6">
      {/* Main Column (Center Feed) */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header Greeting Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hi {user?.name?.split(' ')[0] || 'Pavitra'}! 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Explore opportunities matched to your skills. Learn, grow and get hired.
            </p>
          </div>

          <div className="flex flex-col sm:items-end space-y-1.5 flex-shrink-0">
            <button
              onClick={() => setIsCVModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50/50 hover:border-blue-300 transition-all shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload / Update CV</span>
            </button>
            <div className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                CV processed • {summary?.extracted_skill_count || 12} skills extracted
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-xs flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs, roles or companies..."
              value={searchQuery}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Location Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={locationFilter}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none"
            >
              <option>All Locations</option>
              <option>Bengaluru, India</option>
              <option>Hyderabad, India</option>
              <option>Pune, India</option>
              <option>Remote</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Job Types Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={jobTypeFilter}
              onChange={(e) => handleFilterChange('job_type', e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none"
            >
              <option>All Job Types</option>
              <option>Full-time</option>
              <option>Internship</option>
              <option>Part-time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Platforms Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={platformFilter}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none"
            >
              <option>All Platforms</option>
              <option>LinkedIn</option>
              <option>Indeed</option>
              <option>Naukri</option>
              <option>SkillMatrix</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Section Header & Sorting */}
        {(() => {
          let displayedJobs = [...jobs];
          if (activeSection === 'saved-jobs') {
            displayedJobs = displayedJobs.filter((j) => savedJobIds.includes(j.id));
          } else if (activeSection === 'applications') {
            displayedJobs = displayedJobs.filter((j) => j.has_applied);
          }

          if (sortBy === 'Highest Match') {
            displayedJobs.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          } else if (sortBy === 'Newest First') {
            displayedJobs.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
          }

          const sectionTitle =
            activeSection === 'saved-jobs'
              ? 'Saved Jobs'
              : activeSection === 'applications'
              ? 'My Applications'
              : 'Jobs for You';

          const countLabel =
            activeSection === 'saved-jobs'
              ? `${displayedJobs.length} jobs saved`
              : activeSection === 'applications'
              ? `${displayedJobs.length} applications submitted`
              : `${displayedJobs.length} jobs matched`;

          return (
            <>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{sectionTitle}</h2>
                  <span className="text-xs font-semibold text-slate-500">{countLabel}</span>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 py-1.5 pl-3 pr-7 rounded-xl cursor-pointer focus:outline-none shadow-2xs"
                  >
                    <option>Most Relevant</option>
                    <option>Highest Match</option>
                    <option>Newest First</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Job Cards Feed */}
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Vectorizing skills and matching jobs...</p>
                </div>
              ) : displayedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  {activeSection === 'saved-jobs' ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">No saved jobs yet.</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click the bookmark icon on any job card to save it for quick review.
                      </p>
                      {setActiveSection && (
                        <button
                          onClick={() => setActiveSection('dashboard')}
                          className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          Explore Recommended Jobs
                        </button>
                      )}
                    </>
                  ) : activeSection === 'applications' ? (
                    <>
                      <p className="text-sm font-semibold text-slate-700">You haven't submitted any applications yet.</p>
                      {setActiveSection && (
                        <button
                          onClick={() => setActiveSection('dashboard')}
                          className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          Browse Matched Jobs
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-700">No jobs match your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setLocationFilter('All Locations');
                          setJobTypeFilter('All Job Types');
                          setPlatformFilter('All Platforms');
                          loadDashboardData();
                        }}
                        className="mt-3 px-4 py-1.5 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Reset Filters
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.includes(job.id)}
                      onToggleSave={handleToggleSave}
                      onApply={handleApply}
                      onViewDetails={(j) => setSelectedJob(j)}
                      onTestSkill={(skill) => setTestSkill(skill)}
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Right Sidebar Column */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-5">
        {/* Card 1: Your Skills */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Your Skills</h3>
            <button
              onClick={() => setIsCVModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 mb-3.5 text-[11px] font-semibold text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              <span>Present in your CV</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
              <span>Suggested to Learn</span>
            </div>
          </div>

          {/* Skills Pills Cloud */}
          <div className="flex flex-wrap gap-1.5">
            {allSkills.map((s, index) => (
              <SkillPill
                key={index}
                name={s.name}
                status={s.status}
                onClick={() => setTestSkill(s)}
              />
            ))}
          </div>

          {/* Personalized Learning CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                // Pick the first suggested skill for verification
                const firstSuggested = allSkills.find((s) => s.status === 'suggested') || allSkills[0];
                setTestSkill(firstSuggested);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-bold transition-colors group"
            >
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span>Get Personalized Learning Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Skill Match Overview (Donut Chart) */}
        <SkillMatchDonut
          percentage={summary?.overall_match_percentage || 70}
          skillsHave={summary?.skills_present_count || 8}
          skillsToImprove={summary?.skills_to_improve_count || 5}
          otherSkills={summary?.other_skills_count || 3}
        />
      </div>

      {/* Modals */}
      <CVUploadModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        onUploadSuccess={handleCVUploadSuccess}
      />

      <SkillTestModal
        isOpen={Boolean(testSkill)}
        onClose={() => setTestSkill(null)}
        skill={testSkill}
        onTestCompleted={handleTestCompleted}
      />

      <JobDetailsModal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        onApply={handleApply}
        onTestSkill={(s) => setTestSkill(s)}
      />
    </div>
  );
}
