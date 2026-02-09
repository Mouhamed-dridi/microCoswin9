
import React, { useState, useEffect } from 'react';

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
    a.download = `MicroFix_Backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-8 shrink-0">
        <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Paramètres</h1>
        <p className="text-[#667085] font-medium">Gérez vos préférences et les données de l'application</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 overflow-hidden flex-1">
        <div className="lg:w-64 space-y-1 shrink-0">
          <NavItem id="general" label="Général" activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="data" label="Sauvegarde et Données" activeSection={activeSection} setActiveSection={setActiveSection} />
          <NavItem id="updates" label="Mises à jour" activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

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
                  <p className="text-sm font-bold text-[#344054]">Langue</p>
                  <p className="text-xs text-[#667085]">Français par défaut</p>
                </div>
                <select className="select select-bordered select-sm h-10 w-40 font-semibold text-[#344054]" value={lang} onChange={(e) => setLang(e.target.value)}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </Section>
          )}

          {activeSection === 'data' && (
            <Section title="Gestion des Données">
              <button onClick={handleExportData} className="h-10 px-4 bg-white border border-[#D0D5DD] rounded-lg text-sm font-bold text-[#344054] hover:bg-[#F9FAFB] shadow-sm transition-all flex items-center gap-2">
                Exporter Backup (JSON)
              </button>
            </Section>
          )}

          {activeSection === 'updates' && (
            <Section title="Mises à jour">
              <p className="text-sm font-bold text-[#101828]">Version v10.0.0 (Latest)</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
