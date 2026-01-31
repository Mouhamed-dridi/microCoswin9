
// Fix: Corrected the malformed import statement on line 1
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Ticket, TicketStatus, Group, AppPreferences } from '../types';
import { 
  getTickets, 
  getPreferences, 
  exportDatabase
} from '../services/database';

interface ManagerPageProps {
  user: User;
  onViewDetail: (id: number) => void;
  onLogout: () => void;
}

type TabType = 'settings' | 'groups-users' | 'crm' | 'tickets' | 'documentation' | 'rapport';

const ManagerPage: React.FC<ManagerPageProps> = ({ user, onViewDetail, onLogout }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setTickets(getTickets());
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      t.machine.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  const translateStatus = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'Ouvert';
      case 'In progress': return 'En cours';
      case 'Closed': return 'Fermé';
      default: return status;
    }
  };

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Open': return 'bg-[#EBF5FF] text-[#0066CC]';
      case 'In progress': return 'bg-[#F2F4F7] text-[#344054]';
      case 'Closed': return 'bg-[#D1D5DB] text-[#1F2937]';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const translateUrgency = (priority: string) => {
    if (priority.includes('Critical')) return 'Critique';
    if (priority === 'High') return 'Élevé';
    if (priority === 'Medium') return 'Moyen';
    return 'Faible';
  };

  const getPriorityStyle = (priority: string) => {
    if (priority.includes('Critical') || priority === 'High') return 'border-[#FDA29B] text-[#B42318] bg-white';
    if (priority === 'Medium') return 'border-[#FEC84B] text-[#B54708] bg-white';
    return 'border-[#D6BBFB] text-[#53389E] bg-white';
  };

  const SidebarItem = ({ id, label, icon, active }: { id: TabType, label: string, icon: React.ReactNode, active: boolean }) => (
    <button 
      onClick={() => setActiveTab(id)}
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
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#F9FAFB] border-r border-[#EAECF0] flex flex-col no-print shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-2">
            <div className="text-[#00314e] font-bold text-lg flex items-center gap-2">
              <span className="text-xl font-bold italic tracking-tighter">CapitalOne</span>
              <span className="text-slate-500 font-normal text-sm">Logiciel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            id="settings" 
            label="Paramètres" 
            active={activeTab === 'settings'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>} 
          />
          <SidebarItem 
            id="groups-users" 
            label="Groupe et Utilisateur" 
            active={activeTab === 'groups-users'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
          />
          <SidebarItem 
            id="crm" 
            label="CRM Fournisseur" 
            active={activeTab === 'crm'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>} 
          />
          <SidebarItem 
            id="tickets" 
            label="Tickets" 
            active={activeTab === 'tickets'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} 
          />
          <div className="pt-2 mb-2 border-t border-[#EAECF0] opacity-50"></div>
          <SidebarItem 
            id="documentation" 
            label="Documentation" 
            active={activeTab === 'documentation'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
          />
          <SidebarItem 
            id="rapport" 
            label="Rapport" 
            active={activeTab === 'rapport'} 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
          />
        </nav>

        <div className="p-4 border-t border-[#EAECF0] mt-auto">
          <button className="w-full flex items-center justify-start p-2 text-[#667085] hover:text-[#101828]" onClick={onLogout}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          </button>
        </div>
      </aside>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header Bar */}
        <header className="h-[64px] bg-white border-b border-[#EAECF0] flex items-center justify-end px-8 gap-6">
          <button className="text-[#667085] hover:text-[#101828] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 group pl-2 py-1"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#EAECF0]" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-[#344054]">{user.username === 'manager' ? 'Shea B' : user.username}</span>
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

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-10 max-w-[1440px] w-full mx-auto">
          {activeTab === 'tickets' ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Tickets de support</h1>
                <button className="bg-[#00314e] hover:bg-[#00213d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Créer un nouveau ticket
                </button>
              </div>

              {/* ACTION BAR */}
              <div className="flex items-center gap-3 mb-8">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" 
                    placeholder="Rechercher" 
                    className="w-[320px] h-11 pl-10 pr-4 bg-white border border-[#D0D5DD] rounded-lg text-sm placeholder-[#667085] outline-none focus:border-[#00314e] focus:ring-1 focus:ring-[#00314e] transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 h-11 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Filtrer
                </button>
                <button onClick={exportDatabase} className="flex items-center gap-2 px-4 h-11 border border-[#D0D5DD] rounded-lg text-sm font-semibold text-[#344054] hover:bg-[#F9FAFB] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Exporter
                </button>
              </div>

              {/* TABLE */}
              <div className="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-[#667085] text-[12px] font-semibold border-b border-[#EAECF0]">
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Ticket ID</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">User</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">UserID</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Machine</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Location</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Proties</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Probleme Kind</th>
                      <th className="py-3 px-6 font-semibold uppercase tracking-wider">Probleme Discartion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAECF0]">
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-[#F9FAFB] transition-colors group">
                        <td className="py-4 px-6 text-sm font-mono font-bold text-[#101828]">
                           <button onClick={() => onViewDetail(ticket.id)} className="hover:underline">
                             FX001{ticket.id.toString().slice(-3)}
                           </button>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#667085]">
                           {new Date(ticket.date).toLocaleString('fr-TN', { 
                             day: '2-digit', 
                             month: '2-digit', 
                             year: 'numeric', 
                             hour: 'numeric', 
                             minute: '2-digit',
                             hour12: true 
                           }).toUpperCase()}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-[#344054]">{ticket.operatorName}</td>
                        <td className="py-4 px-6 text-sm text-[#667085]">{ticket.matricule}</td>
                        <td className="py-4 px-6 text-sm text-[#344054]">{ticket.machine}</td>
                        <td className="py-4 px-6 text-sm text-[#667085]">{ticket.location}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${getPriorityStyle(ticket.urgency)}`}>
                            {translateUrgency(ticket.urgency)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#667085]">{ticket.type}</td>
                        <td className="py-4 px-6 text-sm text-[#475467]">
                          <div className="max-w-[240px] truncate" title={ticket.description}>
                            {ticket.description}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               </div>
               <h2 className="text-xl font-bold text-slate-800 capitalize mb-2">{activeTab.replace('-', ' ')}</h2>
               <p className="max-w-sm text-center font-medium">Ce module est en cours d'optimisation pour votre flux de travail d'entreprise. Les données persistantes restent sécurisées.</p>
               {activeTab === 'settings' && (
                  <button onClick={exportDatabase} className="mt-8 btn bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] font-semibold text-sm h-11 px-6 rounded-lg shadow-sm">
                    Générer un instantané de la base de données
                  </button>
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerPage;
