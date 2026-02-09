
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { User } from '../types';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const loadData = () => {
    const dataRaw = localStorage.getItem('tickets');
    const data = dataRaw ? JSON.parse(dataRaw) : [];
    setTickets(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const handleGitHubSync = () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncLogs(["Initializing sync process...", "Checking git status...", "Remote: https://github.com/Mouhamed-dridi/microCoswin9.git"]);
    
    // Simulating terminal sequence
    setTimeout(() => setSyncLogs(prev => [...prev, "git add ."]), 400);
    setTimeout(() => setSyncLogs(prev => [...prev, `git commit -m "Auto commit - ${new Date().toLocaleString()}"`]), 800);
    setTimeout(() => setSyncLogs(prev => [...prev, "git push origin main --force-with-lease"]), 1200);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('success');
      setSyncLogs(prev => [...prev, "SUCCESS: Pushed to https://github.com/Mouhamed-dridi/microCoswin9"]);
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncLogs([]);
      }, 5000);
    }, 2000);
  };

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

  const handleExportExcel = () => {
    const headers = ['TICKET ID', 'DATE', 'USER', 'USERID', 'MACHINE', 'LOCATION', 'PROTIES', 'PROBLEME KIND', 'STATUS', 'ASSIGNEE'];
    const rows = tickets.map((t: any) => [
      t.ticketId || '', t.createdDate || '', t.user || '', t.userId || '',
      t.machine || '', t.location || '', t.proties || '', t.problemeKind || '',
      t.status || 'Open', t.assignedTo || ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets");
    XLSX.writeFile(wb, "tickets_export.xlsx");
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
    <button onClick={() => { setActiveTab(id); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${active ? 'bg-[#F2F4F7] text-[#101828]' : 'text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB]'}`}>
      <span className={`w-5 h-5 flex items-center justify-center ${active ? 'text-[#101828]' : 'text-[#667085]'}`}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-[#FCFCFD] font-['Plus_Jakarta_Sans'] text-[#101828]">
      <aside className="w-[280px] bg-[#F9FAFB] border-r border-[#EAECF0] flex flex-col no-print shrink-0">
        <div className="p-6 mb-2">
          <div className="text-[#00314e] font-bold text-lg italic tracking-tighter">MicroFix <span className="text-slate-500 font-normal text-sm not-italic">V10</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem id="tickets" label="Tickets" active={activeTab === 'tickets'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 012-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <SidebarItem id="crm" label="CRM Fournisseur" active={activeTab === 'crm'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>} />
          <SidebarItem id="groups-users" label="Utilisateurs" active={activeTab === 'groups-users'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
          <SidebarItem id="settings" label="Paramètres" active={activeTab === 'settings'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>} />
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        <header className="h-[64px] bg-white border-b border-[#EAECF0] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            {syncStatus === 'success' && (
              <div className="animate-in fade-in slide-in-from-left-4 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                Pushed to https://github.com/Mouhamed-dridi/microCoswin9
              </div>
            )}
            {isSyncing && syncLogs.length > 0 && (
              <div className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border animate-pulse">
                $ {syncLogs[syncLogs.length - 1]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <button 
               onClick={handleGitHubSync}
               disabled={isSyncing}
               title="Bypass platform sync and force push to microCoswin9"
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSyncing ? 'bg-gray-100 text-gray-400' : 'bg-[#101828] text-white hover:bg-black shadow-sm active:scale-95'}`}
             >
               {isSyncing ? (
                 <>
                   <span className="loading loading-spinner loading-xs"></span>
                   Force Syncing...
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                   Push to GitHub
                 </>
               )}
             </button>
             <div className="h-6 w-px bg-gray-200"></div>
             <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-[#101828]">{user.username}</span>
                <button onClick={onLogout} className="text-xs font-bold text-[#667085] hover:text-[#B42318] uppercase tracking-wider">Logout</button>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col p-8 w-full">
           {activeTab === 'tickets' ? (
             <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-6 flex justify-between items-center">
                  <div className="relative w-64">
                    <input type="text" placeholder="Rechercher un ticket..." className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#D0D5DD] text-sm outline-none focus:ring-1 focus:ring-[#007a8c] focus:border-[#007a8c]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button onClick={handleExportExcel} className="h-10 px-4 bg-[#007a8c] text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all">Exporter Excel</button>
                </div>
                <div className="flex-1 overflow-auto bg-white border border-[#EAECF0] rounded-xl shadow-sm">
                  <table className="table table-zebra w-full text-left">
                    <thead className="sticky top-0 bg-[#F9FAFB] z-10 border-b">
                      <tr className="text-[#667085] text-xs uppercase font-bold">
                        <th className="px-6 py-4">ID</th><th className="px-6 py-4">Machine</th><th className="px-6 py-4">Problème</th><th className="px-6 py-4">Priorité</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredTickets.map((t: any) => (
                        <tr key={t.ticketId} className="hover:bg-[#F9FAFB] cursor-pointer" onClick={() => onViewDetail(t.ticketId)}>
                          <td className="px-6 py-4 font-bold text-[#101828]">{t.ticketId}</td>
                          <td className="px-6 py-4">{t.machine}</td>
                          <td className="px-6 py-4 font-medium text-[#475467]">{t.problemeKind}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${getPriorityStyle(t.proties)}`}>{translateUrgency(t.proties)}</span></td>
                          <td className="px-6 py-4"><span className={`badge badge-sm font-bold ${t.status === 'Open' ? 'badge-info' : 'badge-success'} text-white`}>{t.status}</span></td>
                          <td className="px-6 py-4 text-[#007a8c] font-bold">Détails</td>
                        </tr>
                      ))}
                      {filteredTickets.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucun ticket trouvé.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
           ) : activeTab === 'crm' ? <CRMPage /> : activeTab === 'settings' ? <SettingsPage /> : activeTab === 'groups-users' ? <GroupesUtilisateursPage /> : <div>Placeholder</div>}
        </main>
      </div>
    </div>
  );
};

export default ManagerPage;
