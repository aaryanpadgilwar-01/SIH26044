import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import SkillPill from './SkillPill';

export default function CVUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF or resume file to upload.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadCV(file);
      setResult(res);
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to upload and parse CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Your Resume / CV</h2>
            <p className="text-xs text-slate-500">AI extracts your skills and calculates job match rates</p>
          </div>
        </div>

        {!result ? (
          <div className="space-y-4">
            {/* Drag & drop dropzone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all">
              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileText className="w-10 h-10 text-blue-500 mb-2" />
              <span className="text-sm font-semibold text-slate-800">
                {file ? file.name : 'Click to browse or drop your PDF here'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports PDF, DOCX, TXT (Max 10MB)
              </span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !file}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center space-x-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? 'Analyzing with spaCy...' : 'Analyze & Extract Skills'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Result view */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">CV Successfully Processed!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Extracted <span className="font-bold">{result.extracted_skill_count} skills</span> from your resume.
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">Present Skills Tagged (Green):</h5>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {result.present_skills.map((s, i) => (
                  <SkillPill key={i} name={s} status="present" />
                ))}
              </div>
            </div>

            {result.suggested_skills.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-2">Suggested to Learn for Your Target Role (Coral):</h5>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {result.suggested_skills.map((s, i) => (
                    <SkillPill key={i} name={s} status="suggested" />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Done & View Updated Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
