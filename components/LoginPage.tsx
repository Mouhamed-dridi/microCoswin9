import React, { useState } from 'react';
import { User } from '../types';
import { setSession } from '../services/database';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setError('');
    setShowPassword(false);
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
    // Operator login (opt)
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-12 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none ${showPassword ? 'text-[#007a8c]' : 'text-[#6B7280]'}`}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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