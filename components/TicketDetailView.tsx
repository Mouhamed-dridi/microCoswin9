import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface TicketDetailViewProps {
  ticketId: string;
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface Comment {
  date: string;
  text: string;
}

interface Attachment {
  name: string;
  size: string;
  dataUrl: string;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticketId, user, onBack, onLogout }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = () => {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
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
  };

  const updateTicketInStorage = (updatedTicket: any) => {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const index = tickets.findIndex((t: any) => t.ticketId === ticketId);
    if (index !== -1) {
      tickets[index] = updatedTicket;
      localStorage.setItem('tickets', JSON.stringify(tickets));
      setTicket(updatedTicket);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updated = { ...ticket, status: e.target.value };
    updateTicketInStorage(updated);
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updated = { ...ticket, assignedTo: e.target.value };
    updateTicketInStorage(updated);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      date: new Date().toLocaleString('fr-TN', { dateStyle: 'short', timeStyle: 'short' }),
      text: newComment.trim()
    };
    const updated = {
      ...ticket,
      comments: [...(ticket.comments || []), comment]
    };
    updateTicketInStorage(updated);
    setNewComment('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as 'File' to resolve 'unknown' type errors during array iteration
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const attachment: Attachment = {
          name: file.name,
          size: (file.size / 1048576).toFixed(2) + ' MB',
          dataUrl
        };
        const updated = {
          ...ticket,
          attachments: [...(ticket.attachments || []), attachment]
        };
        updateTicketInStorage(updated);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const filtered = tickets.filter((t: any) => t.ticketId !== ticketId);
      localStorage.setItem('tickets', JSON.stringify(filtered));
      onBack();
    }
  };

  const handleArchive = () => {
    const updated = { ...ticket, status: 'Archivé' };
    updateTicketInStorage(updated);
    alert('Ticket archivé avec succès.');
    onBack();
  };

  if (!ticket) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F2F4F7] font-['Plus_Jakarta_Sans'] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#EAECF0] text-center">
          <h2 className="text-xl font-bold text-[#101828]">Ticket non trouvé</h2>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2.5 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg transition-all"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col space-y-1.5">
      <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider">{label}</label>
      <div className="text-sm font-bold text-[#101828] py-1">
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F2F4F7] p-4 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[720px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAECF0]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAECF0] bg-[#F9FAFB]">
          <h1 className="text-xl font-bold text-[#101828]">Détails du Ticket</h1>
          <button 
            onClick={onBack}
            className="text-[#98A2B3] hover:text-[#667085] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            <DetailRow label="Ticket ID" value={ticket.ticketId} />
            <DetailRow label="Date de création" value={ticket.createdDate} />
            <DetailRow label="Utilisateur" value={ticket.user} />
            <DetailRow label="User ID" value={ticket.userId} />
            <DetailRow label="Machine" value={ticket.machine} />
            <DetailRow label="Location" value={ticket.location} />
            <DetailRow label="Priorité" value={ticket.proties} />
            <DetailRow label="Type de problème" value={ticket.problemeKind} />
          </div>

          {/* Description Block */}
          <div className="pt-4 border-t border-[#F2F4F7]">
            <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider block mb-2">Description du problème</label>
            <div className="text-sm text-[#344054] leading-relaxed bg-[#F9FAFB] p-4 rounded-lg border border-[#EAECF0]">
              {ticket.problemeDiscartion}
            </div>
          </div>

          {/* NEW INTERACTIVE SECTIONS */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4 border-t border-[#F2F4F7]">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider block">Status</label>
              <select
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                value={ticket.status}
                onChange={handleStatusChange}
              >
                <option value="Open">Open</option>
                <option value="En cours">En cours</option>
                <option value="En attente d'action">En attente d'action</option>
                <option value="Fermé">Fermé</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider block">Assigné à</label>
              <select
                className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
                value={ticket.assignedTo}
                onChange={handleAssigneeChange}
              >
                <option value="">Non assigné</option>
                <option value="Technicien 1">Technicien 1</option>
                <option value="Technicien 2">Technicien 2</option>
                <option value="Ahmed">Ahmed</option>
                <option value="Mohamed">Mohamed</option>
                <option value="Ilan">Ilan</option>
              </select>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-[#F2F4F7]">
            <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider block">Commentaires</label>
            <div className="space-y-3">
              {(ticket.comments || []).map((c: Comment, i: number) => (
                <div key={i} className="bg-[#F9FAFB] p-3 rounded-lg border border-[#EAECF0] text-sm">
                  <div className="text-[11px] font-bold text-[#98A2B3] mb-1">{c.date}</div>
                  <div className="text-[#344054]">{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                className="flex-1 h-20 p-3 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] placeholder-[#98A2B3] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm resize-none"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button 
                onClick={handleAddComment}
                className="px-4 py-2 bg-[#007a8c] hover:bg-[#006675] text-white text-xs font-bold rounded-lg shadow-sm transition-all h-fit self-end"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-4 pt-4 border-t border-[#F2F4F7]">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#667085] uppercase tracking-wider">Fichiers joints</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#007a8c] text-[#007a8c] hover:bg-[#E6F4F5] text-xs font-bold rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Uploader
              </button>
              <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileUpload} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(ticket.attachments || []).map((file: Attachment, i: number) => (
                <a 
                  key={i} 
                  href={file.dataUrl} 
                  download={file.name}
                  className="flex items-center gap-3 p-3 bg-white border border-[#EAECF0] rounded-lg hover:border-[#007a8c] transition-all group"
                >
                  <div className="w-8 h-8 bg-[#F9FAFB] rounded flex items-center justify-center text-[#667085]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#101828] truncate">{file.name}</div>
                    <div className="text-[10px] text-[#98A2B3]">{file.size}</div>
                  </div>
                  <svg className="w-4 h-4 text-[#98A2B3] group-hover:text-[#007a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Action Buttons Area */}
          <div className="pt-6 flex items-center justify-between border-t border-[#F2F4F7]">
            <div className="flex gap-3">
              <button 
                onClick={handleArchive}
                className="px-4 py-2 border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] text-xs font-bold rounded-lg transition-all"
              >
                Archiver
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#F9FAFB] border-t border-[#EAECF0] flex justify-end">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            Retour
          </button>
        </div>
      </div>

      <footer className="mt-8 text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest text-center">
        <div>© 2026 MicroFix • Consultation de Ticket Sécurisée</div>
      </footer>
    </div>
  );
};

export default TicketDetailView;