import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface TicketDetailViewProps {
  ticketId: string;
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticketId, user, onBack, onLogout }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = () => {
    const ticketsRaw = localStorage.getItem('tickets');
    const tickets = ticketsRaw ? JSON.parse(ticketsRaw) : [];
    if (tickets) {
      const found = tickets.find((t: any) => t.ticketId === ticketId);
      if (found) {
        setTicket({
          ...found,
          status: found.status || 'Open',
          assignedTo: found.assignedTo || '',
          comments: found.comments || [],
          attachments: found.attachments || []
        });
      }
    }
  };

  const updateTicketInStorage = (updatedTicket: any) => {
    const ticketsRaw = localStorage.getItem('tickets');
    const tickets = ticketsRaw ? JSON.parse(ticketsRaw) : [];
    if (tickets) {
      const index = tickets.findIndex((t: any) => t.ticketId === ticketId);
      if (index !== -1) {
        tickets[index] = updatedTicket;
        localStorage.setItem('tickets', JSON.stringify(tickets));
        setTicket(updatedTicket);
      }
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTicketInStorage({ ...ticket, status: e.target.value });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTicketInStorage({ ...ticket, assignedTo: e.target.value });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      date: new Date().toLocaleString('fr-TN', { dateStyle: 'short', timeStyle: 'short' }),
      text: newComment.trim()
    };
    updateTicketInStorage({
      ...ticket,
      comments: [...(ticket.comments || []), comment]
    });
    setNewComment('');
  };

  const handleDelete = () => {
    if (window.confirm('Supprimer ce ticket ?')) {
      const ticketsRaw = localStorage.getItem('tickets');
      const tickets = ticketsRaw ? JSON.parse(ticketsRaw) : [];
      if (tickets) {
        const filtered = tickets.filter((t: any) => t.ticketId !== ticketId);
        localStorage.setItem('tickets', JSON.stringify(filtered));
        onBack();
      }
    }
  };

  if (!ticket) return (
    <div className="flex h-screen items-center justify-center bg-[#F2F4F7]">
      <span className="loading loading-dots loading-lg text-[#007a8c]"></span>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
            <div className="p-6 border-b border-[#EAECF0] flex justify-between items-center bg-[#F9FAFB]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-[#667085] hover:text-[#101828]"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg></button>
                    <div><h1 className="text-xl font-bold text-[#101828]">Ticket {ticket.ticketId}</h1><p className="text-sm text-[#667085]">Créé le {ticket.createdDate}</p></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { updateTicketInStorage({ ...ticket, status: 'Archivé' }); onBack(); }} className="btn btn-sm btn-ghost text-[#007a8c]">Archiver</button>
                    <button onClick={handleDelete} className="btn btn-sm btn-ghost text-red-600">Supprimer</button>
                </div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-[#98A2B3] uppercase">Machine</label><p className="font-semibold">{ticket.machine}</p></div>
                        <div><label className="text-xs font-bold text-[#98A2B3] uppercase">Localisation</label><p className="font-semibold">{ticket.location}</p></div>
                    </div>
                    <div><label className="text-xs font-bold text-[#98A2B3] uppercase">Description</label><p className="mt-1 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">{ticket.problemeDiscartion}</p></div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div><label className="text-xs font-bold text-[#98A2B3] uppercase">Statut</label><select value={ticket.status} onChange={handleStatusChange} className="select select-bordered select-sm w-full mt-1"><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Closed">Closed</option></select></div>
                        <div><label className="text-xs font-bold text-[#98A2B3] uppercase">Assigné à</label><input value={ticket.assignedTo} onChange={handleAssigneeChange} placeholder="Nom" className="input input-bordered input-sm w-full mt-1" /></div>
                    </div>
                </div>
                <div className="space-y-6 border-l pl-8">
                    <div className="flex flex-col h-[300px]">
                        <label className="text-xs font-bold text-[#98A2B3] uppercase mb-2">Commentaires</label>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {(ticket.comments || []).map((c: any, i: number) => (
                                <div key={i} className="bg-[#F9FAFB] p-3 rounded-lg border border-[#EAECF0]"><p className="text-[11px] font-bold text-[#667085] mb-1">{c.date}</p><p className="text-sm">{c.text}</p></div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Ajouter un commentaire..." className="input input-bordered input-sm flex-1" />
                            <button onClick={handleAddComment} className="btn btn-sm bg-[#007a8c] text-white">Envoyer</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TicketDetailView;