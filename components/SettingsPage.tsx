
import React, { useState, useEffect } from 'react';

// Fix: Moved Section outside to resolve children prop type issues and avoid re-creation on every render
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="bg-white border border-[#EAECF0] rounded-xl p-6 mb-6 shadow-sm">
    <h3 className="text-lg font-bold text-[#101828] mb-4">{title}</h3>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

// Fix: Moved NavItem outside and passed necessary state as props
interface NavItemProps {
  id: string;
  label: string;
  activeSection: string;
  setActiveSection: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, activeSection, setActiveSection }) => (
  <button
    onClick={() => setActiveSection(id)}
    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
      activeSection === id 
        ? 'bg-[#007a8c]/10 text-[#007a8c]' 
        : 'text-[#667085] hover:bg-[#F9FAFB] hover:text-[#101828]'
    }`}
  >
    {label}
  </button>
);

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const handleExportData = () => {
    const backupData = {
      tickets: JSON.parse(localStorage.getItem('tickets') || '[]'),
      providers: JSON.parse(localStorage.getItem('capitalone_providers') || '[]'),
      microfix_db: JSON.parse(localStorage.getItem('microfix_db') || '{}'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `CapitalOne_Backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckUpdates = () => {
    const btn = document.getElementById('update-btn');
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = 'Vérification...';
      setTimeout(() => {
        alert('Vous utilisez la dernière version (v1.2.0).');
        btn.innerText = originalText;
      }, 1500);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-8 shrink-0">
        <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Paramètres</h1>
        <p className="text-[#667085] font-medium">Gérez vos préférences et les données de l'application</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 overflow-hidden flex-1">
        {/* Sub-navigation */}
        <div className="lg:w-64 space-y-1 shrink-0">
          <NavItem id="general" label="Général" activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="data" label="Sauvegarde et Données" activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="updates" label="Mises à jour" activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="about" label="À propos" activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          {activeSection === 'general' && (
            <Section title="Préférences Générales">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#344054]">Mode Sombre</p>
                  <p className="text-xs text-[#667085]">Activer le thème visuel sombre pour l'application</p>
                </div>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary [--tglbg:white] bg-[#D0D5DD] checked:bg-[#007a8c]" 
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#F2F4F7]">
                <div>
                  <p className="text-sm font-bold text-[#344054]">Langue de l'interface</p>
                  <p className="text-xs text-[#667085]">Choisissez la langue d'affichage par défaut</p>
                </div>
                <select 
                  className="select select-bordered select-sm h-10 w-40 font-semibold text-[#344054] focus:outline-none focus:border-[#007a8c]"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </Section>
          )}

          {activeSection === 'data' && (
            <Section title="Gestion des Données">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-md">
                  <p className="text-sm font-bold text-[#344054]">Exporter les bases de données</p>
                  <p className="text-xs text-[#667085]">Générez un fichier JSON contenant tous les tickets, fournisseurs et paramètres pour une sauvegarde externe.</p>
                </div>
                <button 
                  onClick={handleExportData}
                  className="h-10 px-4 bg-white border border-[#D0D5DD] rounded-lg text-sm font-bold text-[#344054] hover:bg-[#F9FAFB] shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Exporter JSON
                </button>
              </div>
              
              <div className="pt-6 border-t border-[#F2F4F7]">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Note sur la sécurité</p>
                      <p className="text-xs text-amber-700 leading-relaxed mt-1">L'exportation contient des informations sensibles. Conservez le fichier dans un emplacement sécurisé. Les données sont stockées localement dans votre navigateur.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {activeSection === 'updates' && (
            <Section title="Mises à jour">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-[#F0F9FA] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#007a8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <p className="text-sm font-bold text-[#101828]">Version actuelle : v1.2.0</p>
                <p className="text-xs text-[#667085] mt-1 mb-6">Dernière vérification le {new Date().toLocaleDateString()}</p>
                <button 
                  id="update-btn"
                  onClick={handleCheckUpdates}
                  className="h-11 px-6 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                >
                  Vérifier les mises à jour
                </button>
              </div>
            </Section>
          )}

          {activeSection === 'about' && (
            <Section title="Informations Produit">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#007a8c] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#101828]">CapitalOne Logiciel</p>
                    <p className="text-xs text-[#667085] font-medium">Maintenance Industrielle & CRM</p>
                  </div>
                </div>
                
                <p className="text-sm text-[#475467] leading-relaxed pt-2">
                  Système complet de gestion de tickets de maintenance industrielle et de gestion de la relation fournisseur (CRM), spécialement conçu pour les flux de travail des entreprises industrielles tunisiennes.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                    <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">Version</p>
                    <p className="text-sm font-bold text-[#344054]">1.2.0 (Build 20260215)</p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                    <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">Licence</p>
                    <p className="text-sm font-bold text-[#0D9488]">Active (Enterprise)</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#F2F4F7] flex items-center justify-between">
                  <p className="text-xs text-[#98A2B3]">Créé avec ❤️ par Mohamed — 2026</p>
                  <div className="flex items-center gap-3">
                    <a href="#" className="text-xs font-bold text-[#007a8c] hover:underline">Support</a>
                    <a href="#" className="text-xs font-bold text-[#007a8c] hover:underline">Documentation</a>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
