
import React from 'react';

interface IconProps {
  className?: string;
}

export const VolumeIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M9.97 4.97a.75.75 0 011.06 0l6.25 6.25a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 11-1.06-1.06L15.69 12 9.97 6.28a.75.75 0 010-1.06zM4.72 6.28a.75.75 0 000 1.06L7.44 10H3a.75.75 0 000 1.5h4.44l-2.72 2.72a.75.75 0 101.06 1.06L10.5 12 5.78 7.34a.75.75 0 00-1.06 0z" clipRule="evenodd" />
    <path d="M11.25 4.5c0-.414.336-.75.75-.75h3.75a.75.75 0 01.75.75v15a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V4.5z" />
  </svg>
);
