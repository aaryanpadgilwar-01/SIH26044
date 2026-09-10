import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, GraduationCap, Code, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const data = await api.getStudentProfile();
      setProfile(data);
      setTargetRole(data.target_role || 'Software Engineer');
      setHeadline(data.headline || '');
      setBio(data.bio || '');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateStudentProfile({
        target_role: targetRole,
        headline,
        bio,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      if (onProfileUpdated) onProfileUpdated();
    } catch (e) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Pavitra S'}</h2>
            <p className="text-xs text-slate-500">{user?.email || 'pavitra@skillmatrix.edu'}</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Career Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option>Software Engineer</option>
              <option>Backend Developer</option>
              <option>Frontend Developer</option>
              <option>Full Stack Engineer</option>
              <option>Data Scientist</option>
              <option>Cloud Engineer</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Your target role determines AI skill-gap recommendations.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Aspiring Software Engineer & Problem Solver"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your learning journey and technical interests..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center space-x-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
