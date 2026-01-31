
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getSession, clearSession } from './services/database';
import LoginPage from './components/LoginPage';
import ManagerPage from './components/ManagerPage';
import TicketDetailView from './components/TicketDetailView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    const activeUser = getSession();
    if (activeUser) {
      setUser(activeUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setSelectedTicketId(null);
  };

  const handleViewDetail = (id: number) => {
    setSelectedTicketId(id);
  };

  const handleBackToDashboard = () => {
    setSelectedTicketId(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F2F4F7]">
        <span className="loading loading-dots loading-lg text-[#00314e]"></span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Handle Ticket Detail View
  if (selectedTicketId !== null) {
    return (
      <TicketDetailView 
        ticketId={selectedTicketId} 
        user={user} 
        onBack={handleBackToDashboard} 
        onLogout={handleLogout} 
      />
    );
  }

  // Manager page handles its own full-screen layout
  if (user.role === 'manager') {
    return <ManagerPage user={user} onViewDetail={handleViewDetail} onLogout={handleLogout} />;
  }

  // Operator Success View (No more OperatorPage)
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F4F7] font-['Plus_Jakarta_Sans']">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl p-10 text-center border border-[#EAECF0]">
          <div className="w-20 h-20 bg-[#EBF5FF] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#007a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#101828] mb-3">Report Submitted</h2>
          <p className="text-[#667085] mb-10 font-medium">
            Thank you, {user.username}. Your maintenance request has been logged successfully and sent to the technical team.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-[#007a8c] hover:bg-[#006675] text-white font-bold rounded-lg transition-all shadow-sm"
            >
              Submit Another Report
            </button>
            <p className="text-xs text-[#98A2B3] font-semibold uppercase tracking-widest">
              MicroFix Transaction Verified
            </p>
          </div>
        </div>
      </main>

      <footer className="p-8 bg-white border-t border-[#EAECF0] flex flex-col items-center gap-2 text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest">
        <div>© 2026 MicroFix • Enterprise Maintenance Solutions</div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 border border-[#EAECF0] rounded text-[10px]">v1.2.0</span>
          <span>Database Persistent Mode Active</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
