
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getSession, clearSession } from './services/database';
import LoginPage from './components/LoginPage';
import ManagerPage from './components/ManagerPage';
import OperatorPage from './components/OperatorPage';
import TicketDetailView from './components/TicketDetailView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for existing session immediately on app load
  useEffect(() => {
    const activeUser = getSession();
    if (activeUser) {
      setUser(activeUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    // After standalone login, we go straight to the relevant landing page
    setShowSuccess(false);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setSelectedTicketId(null);
    setShowSuccess(false);
  };

  const handleViewDetail = (id: number) => {
    setSelectedTicketId(id);
  };

  const handleBackToDashboard = () => {
    setSelectedTicketId(null);
  };

  const handleReportSuccess = () => {
    setShowSuccess(true);
  };

  const handleSubmitAnother = () => {
    setShowSuccess(false);
  };

  // Initial loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F2F4F7]">
        <span className="loading loading-dots loading-lg text-[#007a8c]"></span>
      </div>
    );
  }

  // FIRST GUARD: If no user session, always show Login Page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // SECOND GUARD: Handle Detail View Overlay
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

  // THIRD GUARD: Role-Based Routing
  // Managers land on the support ticket dashboard
  if (user.role === 'manager') {
    return <ManagerPage user={user} onViewDetail={handleViewDetail} onLogout={handleLogout} />;
  }

  // Operators land on the success screen ONLY after a ticket submission
  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F2F4F7] font-['Plus_Jakarta_Sans']">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl p-10 text-center border border-[#EAECF0]">
            <div className="w-20 h-20 bg-[#EBF5FF] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[#007a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#101828] mb-3">Rapport Soumis</h2>
            <p className="text-[#667085] mb-10 font-medium">
              Merci, {user.username}. Votre demande de maintenance a été enregistrée avec succès et transmise à l'équipe technique.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleSubmitAnother}
                className="w-full py-3 bg-[#007a8c] hover:bg-[#006675] text-white font-bold rounded-lg transition-all shadow-sm"
              >
                Soumettre un autre rapport
              </button>
              <button 
                onClick={handleLogout}
                className="w-full py-3 text-[#667085] hover:text-[#B42318] font-bold text-sm transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </main>
        <footer className="p-8 bg-white border-t border-[#EAECF0] flex flex-col items-center gap-2 text-[11px] font-bold text-[#98A2B3] uppercase tracking-widest">
          <div>© 2026 MicroFix • Solutions de Maintenance Industrielle</div>
        </footer>
      </div>
    );
  }

  // Logged-in Operator default view: Ticket Form
  return (
    <OperatorPage 
      user={user} 
      onLogout={handleLogout} 
      onSuccess={handleReportSuccess} 
    />
  );
};

export default App;
