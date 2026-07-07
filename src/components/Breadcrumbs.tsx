import React from 'react';
import Link from 'next/link';

interface BreadcrumbsProps {
  pageName?: string;
}

export default function Breadcrumbs({ pageName = "メディアトップページ" }: BreadcrumbsProps) {
  return (
    <div className="bg-white w-full">
      <div className="px-4 sm:px-10 py-2">
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center shrink-0 text-[#4b5563] hover:text-[#155dfc] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </Link>
          
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9ca3af] mx-2 shrink-0">
            <polyline points="9,18 15,12 9,6"/>
          </svg>

          <span className="text-[#4b5563] text-sm font-normal leading-5 min-w-0 flex-1 truncate">
            {pageName}
          </span>
        </div>
      </div>
    </div>
  );
}