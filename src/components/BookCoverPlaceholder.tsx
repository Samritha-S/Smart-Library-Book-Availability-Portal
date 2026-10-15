import React from 'react';

interface BookCoverPlaceholderProps {
  title: string;
  author?: string;
  className?: string;
}

export const BookCoverPlaceholder: React.FC<BookCoverPlaceholderProps> = ({
  title,
  author,
  className = 'w-full h-full'
}) => {
  // Generate 2-3 initials from title words
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const initials = words
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div
      className={`relative flex flex-col justify-between p-3.5 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white rounded-lg shadow-inner overflow-hidden select-none ${className}`}
    >
      {/* Decorative Warm Amber Book Spine Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-amber-500 shadow-r" />

      {/* Top Banner with Initials Emblem */}
      <div className="pl-2 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase opacity-90">
          Library Edition
        </span>
        <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] text-amber-200">
          {initials}
        </div>
      </div>

      {/* Middle Title */}
      <div className="pl-2 py-2">
        <h4 className="text-xs font-bold leading-snug line-clamp-3 text-white">
          {title}
        </h4>
        {author && (
          <p className="text-[10px] text-teal-200/90 mt-1 line-clamp-1 italic">
            {author}
          </p>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="pl-2 pt-1 border-t border-teal-600/60 flex items-center justify-between text-[9px] text-amber-300/90 font-mono">
        <span>COLLECTION</span>
        <span>AIT-LIB</span>
      </div>
    </div>
  );
};
