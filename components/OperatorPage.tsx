import React, { useState } from 'react';
import { User, ProblemType, UrgencyLevel, LocationType } from '../types';
import { addTicket } from '../services/database';

interface OperatorPageProps {
  user: User;
  onLogout: () => void;
  onSuccess: () => void;
}

const OperatorPage: React.FC<OperatorPageProps> = ({ user, onLogout, onSuccess }) => {
  const [ticketId] = useState(() => `FX001${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [createdDate] = useState(() => new Date().toLocaleString('fr-TN', { dateStyle: 'short', timeStyle: 'short' }));

  const initialFormState = {
    operatorName: '',
    matriculeId: '',
    machineCode: '',
    machineLocation: '' as LocationType | '',
    problemType: 'Mechanical' as ProblemType,
    priority: 'Medium' as UrgencyLevel,
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  // OVERRIDE: Redirect user to login page on cancel
  const handleCancel = () => {
    onLogout();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Collect ALL form data into a single object with specific keys
    const newTicket = {
      ticketId: ticketId,
      createdDate: createdDate,
      user: formData.operatorName,
      userId: formData.matriculeId,
      machine: formData.machineCode,
      location: formData.machineLocation,
      proties: formData.priority,
      problemeKind: formData.problemType,
      problemeDiscartion: formData.description
    };

    try {
      // Persistence logic using localStorage 'tickets' array
      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      existingTickets.push(newTicket);
      localStorage.setItem('tickets', JSON.stringify(existingTickets));

      // Proceed with existing submission logic
      onSuccess();
    } catch (err) {
      setError('Erreur lors de la sauvegarde du rapport localement.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
      
      {/* Top nav space removed as requested */}

      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAECF0]">
          <h1 className="text-lg font-bold text-[#101828]">Report Issue & Operator Login</h1>
          <div className="flex items-center gap-2">
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Display Only Info Section */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#F2F4F7]">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Ticket ID</label>
              <div className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] flex items-center font-mono font-bold">
                {ticketId}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Date de création</label>
              <div className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] flex items-center font-medium">
                {createdDate}
              </div>
            </div>
          </div>

          {/* Section 1 - Operator Credentials */}
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#007a8c] flex items-center justify-center bg-white text-[11px] font-bold text-[#007a8c]">
                  1
                </div>
                <span className="text-sm font-bold text-[#344054]">Operator Credentials</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Operator Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe, Ahmed Ben Ali"
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] flex items-center font-medium outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c]"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Matricule ID</label>
                <input
                  type="text"
                  placeholder="e.g. 12345678"
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-sm text-[#101828] flex items-center font-medium outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c]"
                  value={formData.matriculeId}
                  onChange={(e) => setFormData({ ...formData, matriculeId: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2 - Machine & Problem Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#667085] flex items-center justify-center bg-white text-[11px] font-bold text-[#667085]">
                  2
                </div>
                <span className="text-sm font-bold text-[#344054]">Machine & Problem Details</span>
              </div>
              <svg className="w-4 h-4 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Machine / Asset Code</label>
                <input
                  type="text"
                  placeholder="e.g. MCH-0456"
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#667085] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                  value={formData.machineCode}
                  onChange={(e) => setFormData({ ...formData, machineCode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Machine Location</label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm appearance-none"
                    value={formData.machineLocation}
                    onChange={(e) => setFormData({ ...formData, machineLocation: e.target.value as any })}
                    required
                  >
                    <option value="">Select machine location</option>
                    <option value="Zone 1">Zone 1</option>
                    <option value="Zone 2">Zone 2</option>
                    <option value="Zone 3">Zone 3</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#667085]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 - Technical Problem Details */}
            <div className="flex items-center justify-between group cursor-pointer pt-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#667085] flex items-center justify-center bg-white text-[11px] font-bold text-[#667085]">
                  3
                </div>
                <span className="text-sm font-bold text-[#344054]">Technical Problem Details</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-[#344054]">Problem Type</label>
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
                <label className="text-[13px] font-semibold text-[#344054]">Priority</label>
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
              <label className="text-[13px] font-semibold text-[#344054]">Detailed Problem Description</label>
              <textarea
                placeholder="Please describe the failure / symptoms / what happened in detail (include error codes if any)..."
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
              onClick={onLogout} 
              className="px-4 py-2.5 text-[#667085] hover:text-[#B42318] text-sm font-bold transition-colors uppercase tracking-widest"
            >
              Logout
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