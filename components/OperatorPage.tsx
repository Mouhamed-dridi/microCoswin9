import React, { useState } from 'react';
import { User, ProblemType, UrgencyLevel, LocationType } from '../types';

interface OperatorPageProps {
  user: User;
  onLogout: () => void;
  onSuccess: () => void;
}

const OperatorPage: React.FC<OperatorPageProps> = ({ user, onLogout, onSuccess }) => {
  const [ticketId] = useState(() => `FX001${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [createdDate] = useState(() => new Date().toLocaleString('fr-TN', { dateStyle: 'short', timeStyle: 'short' }));

  const [formData, setFormData] = useState({
    operatorName: '',
    matriculeId: '',
    machineCode: '',
    machineLocation: '' as LocationType | '',
    problemType: 'Mechanical' as ProblemType,
    priority: 'Medium' as UrgencyLevel,
    description: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.machineLocation) {
        setError('Veuillez sélectionner une zone.');
        return;
    }

    const newTicket = {
      ticketId: ticketId,
      createdDate: createdDate,
      user: formData.operatorName,
      userId: formData.matriculeId,
      machine: formData.machineCode,
      location: formData.machineLocation,
      proties: formData.priority,
      problemeKind: formData.problemType,
      problemeDiscartion: formData.description,
      status: 'Open',
      assignedTo: '',
      comments: [],
      attachments: []
    };

    try {
      const ticketsRaw = localStorage.getItem('tickets');
      const existingTickets = ticketsRaw ? JSON.parse(ticketsRaw) : [];
      const updatedTickets = [...existingTickets, newTicket];
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      onSuccess();
    } catch (err) {
      setError('Impossible d\'enregistrer les données localement.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAECF0]">
          <h1 className="text-lg font-bold text-[#101828]">Report Issue & Operator Login</h1>
          <button onClick={onLogout} className="text-[#667085] hover:text-[#B42318] text-xs font-bold uppercase tracking-widest">Logout</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Nom de l'opérateur</label>
               <input type="text" required className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} />
             </div>
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Matricule</label>
               <input type="text" required className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.matriculeId} onChange={e => setFormData({...formData, matriculeId: e.target.value})} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Code Machine</label>
               <input required className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.machineCode} onChange={e => setFormData({...formData, machineCode: e.target.value})} />
             </div>
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Zone</label>
               <select required className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.machineLocation} onChange={e => setFormData({...formData, machineLocation: e.target.value as LocationType})}>
                 <option value="">Sélectionner Zone</option>
                 <option value="Zone 1">Zone 1</option>
                 <option value="Zone 2">Zone 2</option>
                 <option value="Zone 3">Zone 3</option>
                 <option value="Other">Other</option>
               </select>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Type de problème</label>
               <select className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.problemType} onChange={e => setFormData({...formData, problemType: e.target.value as ProblemType})}>
                 <option value="Mechanical">Mechanical</option>
                 <option value="Electrical">Electrical</option>
                 <option value="Hydraulic">Hydraulic</option>
                 <option value="Software/PLC">Software/PLC</option>
                 <option value="Sensor">Sensor</option>
                 <option value="Other">Other</option>
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[13px] font-semibold text-[#344054]">Priorité</label>
               <select className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as UrgencyLevel})}>
                 <option value="Low">Low</option>
                 <option value="Medium">Medium</option>
                 <option value="High">High</option>
                 <option value="Critical – line stopped">Critical – line stopped</option>
               </select>
             </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-[#344054]">Description</label>
            <textarea required className="w-full h-24 p-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAECF0]">
            <button type="submit" className="px-6 py-2.5 bg-[#007a8c] text-white text-sm font-bold rounded-lg shadow-sm active:scale-[0.98]">Envoyer Rapport</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorPage;