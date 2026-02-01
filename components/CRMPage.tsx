import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Provider, getProviders, addProvider } from '../services/crmService';
import ProviderCard from './ProviderCard';

const CRMPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State updated with Website and Type
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    tel: '',
    mail: '',
    website: '',
    type: 'Entreprise' as 'Personnel' | 'Entreprise'
  });

  useEffect(() => {
    setProviders(getProviders());
  }, []);

  const stats = useMemo(() => {
    // Total Providers
    const totalCount = providers.length;
    
    // Nouveaux (Recently added - Jan or Feb 2026)
    const nouveauCount = providers.filter(p => 
      p.createdAt.includes('/01/2026') || p.createdAt.includes('/02/2026')
    ).length;
    
    // Actifs (Using Type Entreprise as a proxy for business partners)
    const activeCount = providers.filter(p => p.type === 'Entreprise').length;

    return {
      total: totalCount,
      nouveaux: nouveauCount,
      actifs: activeCount,
    };
  }, [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [providers, searchQuery]);

  const handleExportExcel = () => {
    const data = filteredProviders.map(p => ({
      "Société": p.company,
      "Nom du contact": p.name,
      "Téléphone": p.tel,
      "Email": p.mail,
      "Site web": p.website || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fournisseurs");
    
    const dateStr = new Date().toLocaleDateString('fr-TN').replace(/\//g, '-');
    XLSX.writeFile(workbook, `CapitalOne_Fournisseurs_${dateStr}.xlsx`);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProvider(formData);
    setProviders(getProviders());
    setShowAddModal(false);
    setFormData({ name: '', company: '', tel: '', mail: '', website: '', type: 'Entreprise' });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">CRM Fournisseur</h1>
          <p className="text-[#667085] font-medium">Gestion des partenaires industriels CapitalOne</p>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:w-fit">
          <div className="bg-white border border-[#EAECF0] rounded-xl px-4 py-3 shadow-sm min-w-[150px]">
            <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Total Fournisseurs</div>
            <div className="text-2xl font-bold text-[#101828]">{stats.total}</div>
          </div>
          <div className="bg-white border border-[#EAECF0] rounded-xl px-4 py-3 shadow-sm min-w-[150px]">
            <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Nouveaux</div>
            <div className="text-2xl font-bold text-[#007a8c]">{stats.nouveaux}</div>
          </div>
          <div className="bg-white border border-[#EAECF0] rounded-xl px-4 py-3 shadow-sm min-w-[150px]">
            <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Actifs Entreprise</div>
            <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-fit">
          <div className="join border border-[#D0D5DD] rounded-lg overflow-hidden shadow-sm bg-white">
            <button 
              onClick={() => setViewMode('grid')}
              className={`join-item btn btn-sm h-10 px-4 normal-case border-none ${viewMode === 'grid' ? 'bg-[#F2F4F7] text-[#101828]' : 'bg-white text-[#667085]'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`join-item btn btn-sm h-10 px-4 normal-case border-none ${viewMode === 'list' ? 'bg-[#F2F4F7] text-[#101828]' : 'bg-white text-[#667085]'}`}
            >
              List
            </button>
          </div>

          <div className="relative flex-1 md:w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Rechercher nom, société..." 
              className="w-full h-10 pl-9 pr-4 bg-white border border-[#D0D5DD] rounded-lg text-sm placeholder-[#98A2B3] focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-fit">
          <button 
            onClick={handleExportExcel}
            className="h-10 border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exporter
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none h-10 bg-[#007a8c] hover:bg-[#006675] text-white px-5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Ajouter Fournisseur
          </button>
        </div>
      </div>

      {/* Main Content View (Grid or List) */}
      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Provider Card Trigger */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="group h-full min-h-[260px] bg-[#F9FAFB] border-2 border-dashed border-[#D0D5DD] hover:border-[#007a8c] hover:bg-[#F0F9FA] rounded-xl flex flex-col items-center justify-center gap-4 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-[#D0D5DD] flex items-center justify-center shadow-sm group-hover:bg-[#007a8c] transition-colors">
                <svg className="w-8 h-8 text-[#667085] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              </div>
              <span className="text-[#667085] font-bold text-sm group-hover:text-[#007a8c] transition-colors max-w-[150px] text-center">
                Ajouter un nouveau fournisseur
              </span>
            </button>

            {filteredProviders.map(p => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                    <th className="w-12 px-6"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" disabled /></th>
                    <th className="text-[12px] font-bold text-[#667085] uppercase tracking-wider px-6 py-4 text-left">Société</th>
                    <th className="text-[12px] font-bold text-[#667085] uppercase tracking-wider px-6 py-4 text-left">Nom du contact</th>
                    <th className="text-[12px] font-bold text-[#667085] uppercase tracking-wider px-6 py-4 text-left">Téléphone</th>
                    <th className="text-[12px] font-bold text-[#667085] uppercase tracking-wider px-6 py-4 text-left">Email</th>
                    <th className="text-[12px] font-bold text-[#667085] uppercase tracking-wider px-6 py-4 text-left">Site web</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {filteredProviders.map(p => (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors group">
                      <td className="px-6 py-4"><input type="checkbox" className="checkbox checkbox-sm checkbox-primary" /></td>
                      <td className="px-6 py-4 font-bold text-[#101828]">{p.company}</td>
                      <td className="px-6 py-4 text-[#344054] font-medium">{p.name}</td>
                      <td className="px-6 py-4 font-semibold text-[#344054] whitespace-nowrap">
                        <a href={`tel:${p.tel}`} className="hover:text-[#007a8c] transition-colors">{p.tel}</a>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${p.mail}`} className="text-[#667085] hover:text-[#007a8c] transition-colors font-medium truncate inline-block max-w-[200px] align-middle">{p.mail}</a>
                      </td>
                      <td className="px-6 py-4">
                        {p.website ? (
                          <a 
                            href={p.website.startsWith('http') ? p.website : `https://${p.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#007a8c] font-semibold hover:underline"
                          >
                            {p.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredProviders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-16 h-16 opacity-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="text-lg font-bold text-[#101828] mb-1">Aucun contact trouvé</h3>
            <p className="text-sm">Essayez de modifier votre recherche.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] border border-[#EAECF0] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <h2 className="text-xl font-bold text-[#101828]">Nouveau Fournisseur</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#667085] hover:text-[#101828] p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Nom du contact</label>
                <input 
                  type="text" 
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] transition-all shadow-sm"
                  placeholder="e.g. Mounir Ben Said"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Société</label>
                <input 
                  type="text" 
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] transition-all shadow-sm"
                  placeholder="e.g. SOTUMAG"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#344054]">Téléphone</label>
                  <input 
                    type="tel" 
                    className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] transition-all shadow-sm"
                    placeholder="+216 -- --- ---"
                    value={formData.tel}
                    onChange={e => setFormData({...formData, tel: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#344054]">Type</label>
                  <select 
                    className="w-full h-11 px-3 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#344054] font-semibold outline-none focus:border-[#007a8c] shadow-sm"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="Entreprise">Entreprise</option>
                    <option value="Personnel">Personnel</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Email professionnel</label>
                <input 
                  type="email" 
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] transition-all shadow-sm"
                  placeholder="contact@societe.com.tn"
                  value={formData.mail}
                  onChange={e => setFormData({...formData, mail: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Site Web (Optionnel)</label>
                <input 
                  type="url" 
                  className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-lg text-sm text-[#101828] outline-none focus:border-[#007a8c] focus:ring-1 focus:ring-[#007a8c] transition-all shadow-sm"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                />
              </div>

              <div className="pt-6 border-t border-[#F2F4F7] flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 h-11 bg-white border border-[#D0D5DD] text-[#344054] text-sm font-bold rounded-lg hover:bg-[#F9FAFB] transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-8 h-11 bg-[#007a8c] hover:bg-[#006675] text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-[0.98]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMPage;