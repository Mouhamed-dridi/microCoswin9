
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { User } from '../types';
import { exportDatabase } from '../services/database';
import OperatorPage from './OperatorPage';
import CRMPage from './CRMPage';
import SettingsPage from './SettingsPage';
import GroupesUtilisateursPage from './GroupesUtilisateursPage';

interface ManagerPageProps {
  user: User;
  onViewDetail: (id: string) => void;
  onLogout: () => void;
}

type TabType = 'settings' | 'groups-users' | 'crm' | 'tickets' | 'documentation' | 'rapport';

const ManagerPage: React.FC<ManagerPageProps> = ({ user, onLogout, onViewDetail }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const localTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    setTickets(localTickets);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfoPopup(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowInfoPopup(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredTickets = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return tickets.filter(ticket => {
      if (!term) return true;
      return (
        (ticket.ticketId || '').toLowerCase().includes(term) ||
        (ticket.machine || '').toLowerCase().includes(term) ||
        (ticket.user || '').toLowerCase().includes(term)
      );
    });
  }, [tickets, searchQuery]);

  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.ticketId === selectedTicketId) || {};
  }, [tickets, selectedTicketId]);

  const updateTicketInStorage = (updatedTicket: any) => {
    const newTickets = tickets.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t);
    setTickets(newTickets);
    localStorage.setItem('tickets', JSON.stringify(newTickets));
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!selectedTicketId) return;
    const updated = { ...selectedTicket, [field]: value };
    updateTicketInStorage(updated);
  };

  const handleDeleteTicket = () => {
    if (!selectedTicketId) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      const newTickets = tickets.filter(t => t.ticketId !== selectedTicketId);
      setTickets(newTickets);
      localStorage.setItem('tickets', JSON.stringify(newTickets));
      setSelectedTicketId(null);
    }
  };

  const handleArchiveTicket = () => {
    if (!selectedTicketId) return;
    const updated = { ...selectedTicket, status: 'Archived' };
    updateTicketInStorage(updated);
    setSelectedTicketId(null);
  };

  const handleExportExcel = () => {
    try {
      const localTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const headers = ['TICKET ID', 'DATE', 'USER', 'USERID', 'MACHINE', 'LOCATION', 'PROTIES', 'PROBLEME KIND', 'PROBLEME DISCARTION', 'STATUS', 'ASSIGNEE', 'TECH EMAIL', 'TECH PHONE'];
      const rows = localTickets.map((ticket: any) => [
        ticket.ticketId || '',
        ticket.createdDate || '',
        ticket.user || '',
        ticket.userId || '',
        ticket.machine || '',
        ticket.location || '',
        ticket.proties || '',
        ticket.problemeKind || '',
        ticket.problemeDiscartion || '',
        ticket.status || 'Open',
        ticket.assignedTo || '',
        ticket.techEmail || '',
        ticket.techPhone || ''
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Tickets");
      XLSX.writeFile(wb, "tickets_export.xlsx");
    } catch (err) {
      console.error(err);
    }
  };

  const translateUrgency = (priority: string) => {
    if (!priority) return 'N/A';
    if (priority.includes('Critical')) return 'Critique';
    if (priority === 'High') return 'Élevé';
    if (priority === 'Medium') return 'Moyen';
    return 'Faible';
  };

  const getPriorityStyle = (priority: string) => {
    if (!priority) return 'border-slate-200 text-slate-400 bg-white';
    if (priority.includes('Critical') || priority === 'High') return 'border-[#FDA29B] text-[#B42318] bg-white';
    if (priority === 'Medium') return 'border-[#FEC84B] text-[#B54708] bg-white';
    return 'border-[#D6BBFB] text-[#53389E] bg-white';
  };

  const SidebarItem = ({ id, label, icon, active }: { id: TabType, label: string, icon: React.ReactNode, active: boolean }) => (
    <button 
      onClick={() => { setActiveTab(id); setSelectedTicketId(null); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
        active 
          ? 'bg-[#F2F4F7] text-[#101828]' 
          : 'text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB]'
      }`}
    >
      <span className={`w-5 h-5 flex items-center justify-center ${active ? 'text-[#101828]' : 'text-[#667085]'}`}>
        {icon}
      </span>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-[#FCFCFD] font-['Plus_Jakarta_Sans'] text-[#101828]">
      
      {/* SIDEBAR - Always Visible */}
      <aside className="w-[280px] bg-[#F9FAFB] border-r border-[#EAECF0] flex flex-col no-print shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-2">
            <div className="text-[#00314e] font-bold text-lg flex items-center gap-2">
              <span className="text-xl font-bold italic tracking-tighter">CapitalOne</span>
              <span className="text-slate-500 font-normal text-sm">Logiciel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem id="settings" label="Paramètres" active={activeTab === 'settings'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>} />
          <SidebarItem id="groups-users" label="Groupe et Utilisateur" active={activeTab === 'groups-users'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
          <SidebarItem id="crm" label="CRM Fournisseur" active={activeTab === 'crm'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>} />
          <SidebarItem id="tickets" label="Tickets" active={activeTab === 'tickets'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        </nav>

        <div className="px-4 py-4 mt-auto border-t border-[#EAECF0] space-y-1">
          <SidebarItem id="documentation" label="Documentation" active={activeTab === 'documentation'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
          <SidebarItem id="rapport" label="Rapport" active={activeTab === 'rapport'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <div className="pt-2">
            <button className="w-full flex items-center justify-start p-2 text-[#667085] hover:text-[#101828]" onClick={onLogout}>
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[64px] bg-white border-b border-[#EAECF0] flex items-center justify-end px-8 gap-6 shrink-0">
          <div className="relative" ref={infoRef}>
            <button onClick={() => setShowInfoPopup(!showInfoPopup)} className="text-[#667085] hover:text-[#101828] transition-colors p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            {showInfoPopup && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[#EAECF0] p-4 z-50 text-xs text-[#475467] leading-relaxed">
                <p>Version : 1.2.0</p>
                <p>Provider : Microindust</p>
                <p>Licence : Active</p>
                <p className="my-1">--------------------</p>
                <p>©2026 MicroIndust, Inc. All Rights Reserved.</p>
              </div>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 group pl-2 py-1">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#EAECF0]" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-[#344054]">{user.username === 'admin' ? 'Admin User' : user.username}</span>
                <svg className="w-4 h-4 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#EAECF0] py-1 z-50 overflow-hidden">
                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm text-[#B42318] hover:bg-[#FEF3F2] font-semibold transition-colors">Déconnexion</button>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-hidden flex flex-col p-8 w-full">
          {activeTab === 'tickets' ? (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Toolbar Header */}
              <div className="flex items-center justify-between mb-8 shrink-0">
                <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Tickets de support</h1>
                <button onClick={() => setShowCreateForm(true)} className="bg-[#00314e] hover:bg-[#00213d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Nouveau ticket
                </button>
              </div>

              {/* Action Bar (Search & Export) */}
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" 
                    placeholder="Rechercher par ID, machine ou utilisateur..." 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#D0D5DD] rounded-lg text-sm placeholder-[#667085] outline-none focus:border-[#00314e] focus:ring-1 focus:ring-[#00314e] transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 h-11 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Exporter
                </button>
              </div>

              {/* SIDE-BY-SIDE LAYOUT CONTAINER */}
              <div className="flex flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                
                {/* TICKETS TABLE SECTION */}
                <div className={`flex flex-col min-h-0 transition-all duration-300 ${selectedTicketId ? 'w-2/3' : 'w-full'}`}>
                  <div className="bg-white border border-[#EAECF0] rounded-xl overflow-auto shadow-sm flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-[#F9FAFB] text-[#667085] text-[12px] font-semibold border-b border-[#EAECF0]">
                          <th className="py-3 px-6 uppercase tracking-wider">Ticket ID</th>
                          <th className="py-3 px-6 uppercase tracking-wider">Date</th>
                          <th className="py-3 px-6 uppercase tracking-wider">User</th>
                          {!selectedTicketId && <th className="py-3 px-6 uppercase tracking-wider">Machine</th>}
                          <th className="py-3 px-6 uppercase tracking-wider">Priorité</th>
                          <th className="py-3 px-6 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAECF0]">
                        {filteredTickets.map((ticket, idx) => (
                          <tr 
                            key={ticket.ticketId || idx} 
                            className={`hover:bg-[#F9FAFB] transition-colors group cursor-pointer ${selectedTicketId === ticket.ticketId ? 'bg-[#F2F4F7]' : ''}`}
                            onClick={() => setSelectedTicketId(ticket.ticketId)}
                          >
                            <td className="py-4 px-6 text-sm font-mono font-bold text-[#101828]">
                               <span className="text-[#007a8c] group-hover:underline cursor-pointer">{ticket.ticketId}</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-[#667085]">{ticket.createdDate}</td>
                            <td className="py-4 px-6 text-sm font-medium text-[#344054]">{ticket.user}</td>
                            {!selectedTicketId && <td className="py-4 px-6 text-sm text-[#344054]">{ticket.machine}</td>}
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${getPriorityStyle(ticket.proties)}`}>
                                {translateUrgency(ticket.proties)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold uppercase border ${ticket.status === 'Closed' ? 'border-green-200 text-green-700 bg-green-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                                  {ticket.status || 'Open'}
                                </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* DETAILS PANEL SECTION */}
                {selectedTicketId && (
                  <div className="w-1/3 flex flex-col border border-[#EAECF0] rounded-xl bg-white shadow-lg animate-in slide-in-from-right duration-300 overflow-hidden">
                    {/* Panel Header */}
                    <div className="p-5 border-b border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between shrink-0">
                       <h2 className="text-lg font-bold text-[#101828]">Détails du Ticket</h2>
                       <button 
                         onClick={() => setSelectedTicketId(null)} 
                         className="px-4 py-1.5 bg-white border border-[#007a8c] text-[#007a8c] hover:bg-[#F0F9FA] text-xs font-bold rounded-lg transition-all"
                       >
                         Retour
                       </button>
                    </div>

                    {/* Panel Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      
                      {/* Ticket Info - Two Column Grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">TICKET ID</label>
                          <div className="text-sm font-mono font-bold text-[#101828]">{selectedTicket.ticketId || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">DATE CRÉATION</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.createdDate || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">UTILISATEUR</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.user || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">USER ID</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.userId || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">MACHINE</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.machine || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">LOCATION</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.location || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">PRIORITÉ</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.proties || 'N/A'}</div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">TYPE</label>
                          <div className="text-sm text-[#101828] font-medium">{selectedTicket.problemeKind || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Problem Description Area */}
                      <div className="pt-4 border-t border-[#F2F4F7]">
                        <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-2">DESCRIPTION DU PROBLÈME</label>
                        <div className="p-4 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg text-sm text-[#101828] leading-relaxed whitespace-pre-wrap min-h-[100px]">
                          {selectedTicket.problemeDiscartion || 'Aucune description fournie.'}
                        </div>
                      </div>

                      {/* Assignment & Status Controls (Editable) */}
                      <div className="pt-4 border-t border-[#F2F4F7] space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Status</label>
                          <select 
                            className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] transition-all shadow-sm"
                            value={selectedTicket.status || 'Open'}
                            onChange={(e) => handleFieldChange('status', e.target.value)}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Waiting for Action">Waiting for Action</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Assigné à</label>
                          <input 
                            type="text" 
                            className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] shadow-sm"
                            placeholder="Nom du technicien"
                            value={selectedTicket.assignedTo || ''}
                            onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Email Technicien</label>
                            <input 
                              type="email" 
                              className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] shadow-sm"
                              placeholder="tech@microindust.com"
                              value={selectedTicket.techEmail || ''}
                              onChange={(e) => handleFieldChange('techEmail', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block">Téléphone Technicien</label>
                            <input 
                              type="tel" 
                              className="w-full h-10 px-3 border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] shadow-sm"
                              placeholder="+216 -- --- ---"
                              value={selectedTicket.techPhone || ''}
                              onChange={(e) => handleFieldChange('techPhone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Block */}
                      <div className="pt-6 border-t border-[#F2F4F7] space-y-3 pb-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={handleArchiveTicket} 
                            className="flex-1 py-2.5 border border-[#D0D5DD] text-[#344054] text-xs font-bold rounded-lg hover:bg-[#F9FAFB] transition-colors"
                          >
                            Archiver
                          </button>
                          <button 
                            onClick={handleDeleteTicket} 
                            className="flex-1 py-2.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Panel Footer Tagline */}
                    <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#EAECF0] text-center">
                      <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-widest">
                        MicroFix • Sessions Sécurisée
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'crm' ? (
            <CRMPage />
          ) : activeTab === 'settings' ? (
            <SettingsPage />
          ) : activeTab === 'groups-users' ? (
            <GroupesUtilisateursPage />
          ) : (
            /* PLACEHOLDER FOR OTHER MODULES */
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               </div>
               <h2 className="text-xl font-bold text-slate-800 capitalize mb-2">{activeTab.replace('-', ' ')}</h2>
               <p className="max-w-sm text-center font-medium">Ce module est en cours d'optimisation pour votre flux de travail d'entreprise.</p>
            </div>
          )}
        </main>
      </div>

      {/* NEW TICKET OVERLAY */}
      {showCreateForm && (
        <div className="fixed inset-0 z-[100] bg-[#F2F4F7] overflow-y-auto">
           <OperatorPage 
             user={user} 
             onLogout={() => setShowCreateForm(false)} 
             onSuccess={() => { setShowCreateForm(false); loadData(); }} 
           />
        </div>
      )}
    </div>
  );
};

export default ManagerPage;
