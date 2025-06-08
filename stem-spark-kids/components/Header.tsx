
import React from 'react';
import { APP_TITLE } from '../constants';
import { SparkleIcon } from './icons/SparkleIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-5 flex items-center justify-center sm:justify-start">
        <SparkleIcon className="h-10 w-10 mr-3 text-yellow-300" />
        <h1 className="text-3xl font-bold tracking-tight">{APP_TITLE}</h1>
      </div>
    </header>
  );
};
