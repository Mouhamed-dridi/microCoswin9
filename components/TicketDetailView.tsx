
import React, { useState, useEffect } from 'react';
import { Ticket, User, TicketStatus } from '../types';
import { getTickets, updateTicketFull, deleteTicket } from '../services/database';

interface TicketDetailViewProps {
  ticketId: number;
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticketId, user, onBack, onLogout }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState<TicketStatus>('Open');

  const refreshTicketData = () => {
    const allTickets = getTickets();
    const found = allTickets.find(t => t.id === ticketId);
    if (found) {
      setTicket(found);
      setResolution(found.resolution || '');
      setStatus(found.status);
    }
  };

  useEffect(() => { refreshTicketData(); }, [ticketId]);

  const handleUpdate = () => {
    if (!ticket) return;
    updateTicketFull(ticket.id, { status, resolution });
    refreshTicketData();
    alert('Entrée de journal enregistrée avec succès dans les dossiers persistants.');
  };

  const handleDelete = () => {
    if (!ticket) return;
    if (window.confirm("CRITIQUE : Effacer définitivement ce record de maintenance ? Cette action est irréversible.")) {
      deleteTicket(ticket.id);
      onBack();
    }
  };

  const translateUrgency = (priority: string) => {
    if (priority.includes('Critical')) return 'Critique';
    if (priority === 'High') return 'Élevé';
    if (priority === 'Medium') return 'Moyen';
    return 'Faible';
  };

  const translateType = (type: string) => {
    switch(type) {
      case 'Mechanical': return 'Mécanique';
      case 'Electrical': return 'Électrique';
      case 'Hydraulic': return 'Hydraulique';
      case 'Software/PLC': return 'Logiciel/API';
      case 'Sensor': return 'Capteur';
      case 'Other': return 'Autre';
      default: return type;
    }
  }

  if (!ticket) return <div className="p-20 text-center font-bold">Interrogation du dossier #{ticketId}...</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Plus_Jakarta_Sans'] text-slate-900">
      <header className="h-[64px] bg-white border-b border-slate-100 flex items-center justify-between px-8 no-print shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Retour aux tickets
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Contrôle de Maintenance</span>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-6 h-6 rounded-full" />
              <span className="text-xs font-bold">{user.username}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-10 max-w-[1000px] w-full mx-auto">
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-mono text-slate-400">#{ticket.id}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-sm text-slate-400">{new Date(ticket.date).toLocaleString()}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{ticket.machine}</h1>
            <p className="text-slate-500 font-medium">Signalé par {ticket.operatorName} ({ticket.location})</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Priorité</p>
                <span className={`px-4 py-1 rounded-full text-[12px] font-bold border ${ticket.urgency.includes('Critical') ? 'border-red-600 text-red-600' : 'border-blue-600 text-blue-600'}`}>
                    {translateUrgency(ticket.urgency)}
                </span>
            </div>
            <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Catégorie</p>
                <p className="text-sm font-bold">{translateType(ticket.type)}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-lg">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Statut du flux</p>
                <select 
                    className="select select-sm w-full bg-white border-slate-200 rounded-md font-bold text-xs h-10"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                    disabled={user.role !== 'manager'}
                >
                    <option value="Open">Ouvert</option>
                    <option value="In progress">En cours</option>
                    <option value="Closed">Fermé</option>
                </select>
            </div>
        </div>

        <div className="space-y-10">
            <section>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Détails du problème</h3>
                <div className="p-6 bg-white border border-slate-100 rounded-lg text-slate-600 leading-relaxed text-sm">
                    {ticket.description}
                </div>
            </section>

            {user.role === 'manager' && (
                <section className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Journal de résolution de maintenance</h3>
                        <textarea 
                            className="textarea textarea-bordered w-full h-40 rounded-lg text-sm border-slate-200 bg-slate-50 focus:bg-white focus:ring-0 transition-all" 
                            value={resolution} 
                            onChange={(e) => setResolution(e.target.value)} 
                            placeholder="Ajouter des notes internes sur la réparation..."
                        ></textarea>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleUpdate} className="btn bg-[#00314e] hover:bg-[#002135] text-white rounded-md flex-1 font-bold">
                            Enregistrer les modifications
                        </button>
                        <button onClick={handleDelete} className="btn btn-outline btn-error rounded-md px-8 font-bold">
                            Supprimer
                        </button>
                    </div>
                </section>
            )}
        </div>
      </main>
    </div>
  );
};

export default TicketDetailView;
