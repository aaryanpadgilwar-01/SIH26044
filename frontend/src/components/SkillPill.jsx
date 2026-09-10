import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';

export default function SkillPill({ name, status = 'present', isPresent, onClick, showIcon = true, size = 'md' }) {
  const isGood = isPresent !== undefined ? isPresent : (status === 'present' || status === 'verified');
  const isVerified = status === 'verified';

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2.5 py-0.5'
    : 'text-xs px-3 py-1';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center space-x-1 font-medium rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 select-none ${sizeClasses} ${
        isVerified
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-200'
          : isGood
          ? 'bg-[#dcfce7] text-[#15803d]'
          : 'bg-[#fee2e2] text-[#b91c1c]'
      }`}
      title={isVerified ? 'Verified Skill' : isGood ? 'Present in your CV' : 'Skill Gap — Click to take verification test'}
    >
      {showIcon && (
        <span>
          {isVerified ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
          ) : isGood ? (
            <Check className="w-3.5 h-3.5 text-[#15803d] inline" strokeWidth={3} />
          ) : (
            <X className="w-3.5 h-3.5 text-[#b91c1c] inline" strokeWidth={3} />
          )}
        </span>
      )}
      <span>{name}</span>
    </span>
  );
}
