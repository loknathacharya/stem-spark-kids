
import React from 'react';
import { APP_TITLE } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 py-6 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Let's learn and grow!</p>
      </div>
    </footer>
  );
};
