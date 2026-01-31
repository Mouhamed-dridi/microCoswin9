
import React, { useState } from 'react';
import { User, ProblemType, UrgencyLevel, LocationType } from '../types';
import { addTicket } from '../services/database';

interface OperatorPageProps {
  user: User;
  onLogout: () => void;
  onSuccess: () => void;
}

const OperatorPage: React.FC<OperatorPageProps> = ({ user, onLogout, onSuccess }) => {
  const initialFormState = {
    machineCode: '',
    machineLocation: '' as LocationType | '',
    problemType: 'Mechanical' as ProblemType,
    priority: 'Medium' as UrgencyLevel,
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  const handleCancel = () => {
    setFormData(initialFormState);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Save the maintenance ticket to the persistent database
    addTicket({
      machine: formData.machineCode || 'Équipement Inconnu',
      location: (formData.machineLocation as LocationType) || 'Other',
      type: formData.problemType,
      urgency: formData.priority,
      description: formData.description || 'Aucune description fournie.',
      operatorName: user.username,
      matricule: 'N/A', // Using user session info
      reporter: user.username,
    });

    onSuccess();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
      
      {/* Top Nav for logged in operator */}
      <div className="w-full max-w-[560px] flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#EAECF0]" />
           <span className="text-sm font-bold text-[#344054]">{user.username}</span>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-[#667085] hover:text-[#B42318] transition-colors uppercase tracking-widest">
          Déconnexion
        </button>
      </div>

      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAECF0]">
          <h1 className="text-lg font-bold text-[#101828]">Nouveau Rapport de Maintenance</h1>
          <button 
            type="button" 
            onClick={handleCancel}
            className="text-[#98A2B3] hover:text-[#667085] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Section info (Static for logged in user) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#007a8c] flex items-center justify-center bg-white">
                  <svg className="w-4 h-4 text-[#007a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-[#007a8c]">Session Active : {user.username}</span>
              </div>
            </div>
          </div>

          {/* Section 2 - Incident Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#667085] flex items-center justify-center bg-white text-[11px] font-bold text-[#667085]">
                  2
                </div>
                <span className="text-sm font-bold text-[#344054]">Détails Machine & Incident</span>
              </div>
              <svg className="w-4 h-4 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Code Machine</label>
                <input
                  type="text"
                  placeholder="ID de l'Équipement"
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#667085] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                  value={formData.machineCode}
                  onChange={(e) => setFormData({ ...formData, machineCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Emplacement</label>
                <input
                  type="text"
                  placeholder="Zone/Site"
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#667085] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                  value={formData.machineLocation}
                  onChange={(e) => setFormData({ ...formData, machineLocation: e.target.value as any })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Type de Problème</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm appearance-none"
                    value={formData.problemType}
                    onChange={(e) => setFormData({ ...formData, problemType: e.target.value as ProblemType })}
                  >
                    <option value="Mechanical">Mécanique</option>
                    <option value="Electrical">Électrique</option>
                    <option value="Hydraulic">Hydraulique</option>
                    <option value="Sensor">Capteur</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#667085]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Priorité</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm appearance-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as UrgencyLevel })}
                  >
                    <option value="Low">Faible</option>
                    <option value="Medium">Moyen</option>
                    <option value="High">Élevé</option>
                    <option value="Critical – line stopped">Critique</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#667085]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#344054]">Description Détaillée</label>
              <textarea
                placeholder="Décrire la panne technique..."
                className="w-full h-24 p-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#667085] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>
          </div>

          {error && (
            <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Envoyer Rapport
            </button>
          </div>
        </form>
      </div>
      
      <footer className="mt-8 text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest text-center">
        <div>© 2026 MicroFix • Sessions Opérateur Sécurisée</div>
      </footer>
    </div>
  );
};

export default OperatorPage;
