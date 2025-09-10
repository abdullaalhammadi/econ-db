import React from 'react';

interface DomainChipProps {
  domain: string;
  size?: 'sm' | 'md';
}

const domainColors: Record<string, { bg: string; text: string }> = {
  'Demographic': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Social': { bg: 'bg-green-100', text: 'text-green-800' },
  'Health': { bg: 'bg-red-100', text: 'text-red-800' },
  'Education': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Housing': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Energy': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Labor Market': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  'Economy': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Tourism': { bg: 'bg-pink-100', text: 'text-pink-800' },
};

const DomainChip: React.FC<DomainChipProps> = ({ domain, size = 'md' }) => {
  if (!domain) return null;
  
  const colors = domainColors[domain] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';
  
  return (
    <span className={`inline-flex items-center ${colors.bg} ${colors.text} ${sizeClasses} rounded-full font-medium`}>
      {domain}
    </span>
  );
};

export default DomainChip;