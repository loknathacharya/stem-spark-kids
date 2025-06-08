
import React from 'react';

interface IconProps {
  className?: string;
}

export const HistoryIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M12 2.25c-5.376 0-9.75 4.374-9.75 9.75s4.374 9.75 9.75 9.75 9.75-4.374 9.75-9.75S17.376 2.25 12 2.25zM12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12 6.75a.75.75 0 01.75.75v5.016l3.164 1.827a.75.75 0 11-.73 1.298l-3.5-2.023A.75.75 0 0111.25 13.5V7.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
