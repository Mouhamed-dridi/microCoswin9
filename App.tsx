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
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const activeUser = await getSession();
        if (activeUser) {
          setUser(activeUser);
        }
      } catch (err) {
        console.error('App initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setShowSuccess(false);
  };

  const handleLogout = async () => {
    await clearSession();
    setUser(null);
    setShowSuccess(false);
    setSelectedTicketId(null);
  };

  const handleReportSuccess = () => {
    setShowSuccess(true);
  };

  const handleSubmitAnother = () => {
    setShowSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F2F4F7] p-8 text-center">
        <span className="loading loading-dots loading-lg text-[#007a8c] mb-4"></span>
        <p className="text-[#667085] font-medium">Chargement de MicroFix...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === 'manager') {
    if (selectedTicketId) {
      return (
        <TicketDetailView 
          ticketId={selectedTicketId} 
          user={user} 
          onBack={() => setSelectedTicketId(null)} 
          onLogout={handleLogout} 
        />
      );
    }
    return (
      <ManagerPage 
        user={user} 
        onViewDetail={(id) => setSelectedTicketId(id)} 
        onLogout={handleLogout} 
      />
    );
  }

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
              Merci, {user.username}. Votre demande de maintenance a été enregistrée avec succès.
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
                Logout
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

  return (
    <OperatorPage 
      user={user} 
      onLogout={handleLogout} 
      onSuccess={handleReportSuccess} 
    />
  );
};

export default App;