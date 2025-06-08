
import React from 'react';

interface IconProps {
  className?: string;
}

export const EyeIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM12.001 19.5c3.978 0 7.641-2.545 9.092-6.553-.474-1.345-1.313-2.53-2.384-3.495A8.225 8.225 0 0012.001 7.5a8.225 8.225 0 00-4.708 1.952c-1.07  .965-1.91 2.15-2.384 3.495C4.36 16.955 8.022 19.5 12.001 19.5z" clipRule="evenodd" />
  </svg>
);
