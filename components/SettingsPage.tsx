
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
          <NavItem id="github" label="GitHub Integration" activeSection={activeSection} setActiveSection={setActiveSection} />
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

          {activeSection === 'github' && (
            <Section title="Diagnostic GitHub">
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#101828]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <div>
                      <p className="text-sm font-bold">microCoswin9</p>
                      <p className="text-xs text-[#667085]">Mouhamed-dridi/microCoswin9</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-200">Connecté</span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Problème de "Synchronisation infinie" détecté
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed mb-3">
                    Si le bouton GitHub de la plateforme reste bloqué sur "Syncing your changes", cela signifie que le service d'arrière-plan de l'IDE est gelé. Pour débloquer la situation, ouvrez le terminal et exécutez ces commandes :
                  </p>
                  <div className="bg-black/90 p-3 rounded-md font-mono text-[10px] text-emerald-400 space-y-1">
                    <p>git add .</p>
                    <p>git commit -m "manual unblock"</p>
                    <p>git push origin main --force</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-[#344054] mb-2 uppercase tracking-wider">Repository Link</p>
                  <div className="flex gap-2">
                    <input readOnly value="https://github.com/Mouhamed-dridi/microCoswin9.git" className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono text-gray-600 outline-none" />
                    <button onClick={() => { navigator.clipboard.writeText("https://github.com/Mouhamed-dridi/microCoswin9.git"); alert("Lien copié !"); }} className="px-3 py-2 bg-white border border-gray-200 rounded text-xs font-bold hover:bg-gray-50">Copier</button>
                  </div>
                </div>
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
