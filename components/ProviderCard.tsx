import React from 'react';
import { Provider } from '../services/crmService';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  // Logic to get initials from company or name (first 2 characters)
  const getInitials = () => {
    const source = provider.company || provider.name || '??';
    return source.trim().slice(0, 2).toUpperCase();
  };

  // Fixed palette for initials circle background
  const getColorClass = () => {
    const colors = [
      'bg-[#0D9488]', // teal-600
      'bg-[#2563EB]', // blue-600
      'bg-[#4F46E5]', // indigo-600
      'bg-[#9333EA]', // purple-600
      'bg-[#0891B2]', // cyan-600
      'bg-[#059669]'  // emerald-600
    ];
    return colors[provider.id % colors.length];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition group flex flex-col h-full">
      {/* Top Row: Initials, Company Name, Ellipsis */}
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Left: Initials Badge */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0 shadow-sm ${getColorClass()}`}>
            {getInitials()}
          </div>

          {/* Center: Company Name */}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate leading-tight group-hover:text-gray-700 transition-colors">
              {provider.company || provider.name}
            </h3>
          </div>
        </div>

        {/* Right: Options Ellipsis */}
        <div className="dropdown dropdown-end shrink-0">
          <label tabIndex={0} className="p-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12h.01M12 18h.01M12 6h.01" />
            </svg>
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-white border border-gray-100 rounded-lg w-32 text-xs font-semibold z-20">
            <li><a className="py-2 hover:bg-gray-50">Modifier</a></li>
            <li><a className="py-2 text-red-600 hover:bg-red-50">Supprimer</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Contact List */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center shrink-0 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <a href={`mailto:${provider.mail}`} className="text-sm text-gray-600 hover:text-gray-900 truncate font-medium transition-colors">
            {provider.mail}
          </a>
        </div>

        {/* Tel */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center shrink-0 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
            </svg>
          </div>
          <a href={`tel:${provider.tel}`} className="text-sm text-gray-600 hover:text-gray-900 font-semibold transition-colors">
            {provider.tel}
          </a>
        </div>

        {/* Website (only if exists) */}
        {provider.website && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center shrink-0 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <a 
              href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-[#0D9488] hover:underline font-semibold truncate transition-all"
            >
              {provider.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderCard;