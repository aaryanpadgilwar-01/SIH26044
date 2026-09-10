import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function SkillTestModal({ isOpen, onClose, skill, onTestCompleted }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testData, setTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && skill) {
      loadTest();
    } else {
      setTestData(null);
      setAnswers({});
      setResult(null);
      setError(null);
    }
  }, [isOpen, skill]);

  const loadTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSkillTest(skill.skill_id || skill.id);
      setTestData(data);
    } catch (err) {
      setError(err.message || 'Failed to load test questions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !skill) return null;

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    const qCount = testData?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < qCount) {
      setError(`Please answer all ${qCount} questions before submitting.`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitSkillTest(skill.skill_id || skill.id, answers);
      setResult(res);
      if (onTestCompleted) onTestCompleted(res);
    } catch (err) {
      setError(err.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">{skill.name} Skill Verification</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                AI Assessment
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Score ≥ 70% to earn an industry-verified badge and boost your job match score!
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-600">
              Generating tailored questions for <span className="text-blue-600 font-bold">{skill.name}</span>...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions form */}
        {!loading && testData && !result && (
          <div className="space-y-5">
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {testData.questions.map((q, qIndex) => (
                <div key={q.id || qIndex} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-900 mb-3">
                    <span className="text-blue-600 mr-1.5">Q{qIndex + 1}.</span> {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = answers[String(q.id)] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          onClick={() => handleOptionSelect(q.id, optIndex)}
                          className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                {Object.keys(answers).length} of {testData.questions.length} answered
              </span>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center space-x-2 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Grading...' : 'Submit Assessment'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Banner */}
        {result && (
          <div className="space-y-5 py-2">
            <div
              className={`p-6 rounded-2xl border text-center ${
                result.passed
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              {result.passed ? (
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              ) : (
                <Award className="w-12 h-12 text-amber-600 mx-auto mb-2" />
              )}
              <h3 className="text-xl font-black mb-1">
                {result.passed ? 'Skill Verified!' : 'Needs Practice'}
              </h3>
              <p className="text-xs font-medium max-w-md mx-auto mb-3">
                {result.message}
              </p>
              <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200 text-xs font-bold">
                <span>Score: {result.score}%</span>
                <span>•</span>
                <span>
                  {result.correct_count} / {result.total_count} Correct
                </span>
                <span>•</span>
                <span>Threshold: {result.threshold}%</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
