
import React, { useState } from 'react';
import { User } from '../types';
import { setSession } from '../services/database';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    const p = password.trim();

    // Manager login (Admin)
    if (u === 'admin' && p === 'admin123') {
      const user: User = { username: 'admin', role: 'manager' };
      setSession(user);
      onLogin(user);
    } 
    // Operator login (opt) - Updated to lowercase as requested
    else if (u === 'opt' && p === 'opt123') {
      const user: User = { username: 'opt', role: 'operator' };
      setSession(user);
      onLogin(user);
    } else {
      setError('Nom d\'utilisateur ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        
        {/* Branding/Header */}
        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-[#007a8c] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#101828]">MicroFix</h1>
          <p className="text-sm text-[#667085] mt-1 font-medium">Portail de Maintenance Industrielle</p>
        </div>

        <div className="px-8 pt-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              {/* Renamed label from 'login' to 'Utilisateur' */}
              <label className="text-[13px] font-semibold text-[#344054]">Utilisateur</label>
              <input
                type="text"
                placeholder="e.g. John Doe, Ahmed Ben Ali"
                className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#344054]">Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                {error}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                className="w-full h-11 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]"
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full h-11 bg-white border border-[#D0D5DD] text-[#344054] text-sm font-semibold rounded-lg hover:bg-[#F9FAFB] transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div className="px-8 py-4 bg-[#F9FAFB] border-t border-[#EAECF0] text-center">
          <p className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest">
            Accès Sécurisé • v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
