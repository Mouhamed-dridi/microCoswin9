
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Provider, getProviders, addProvider, saveProviders } from '../services/crmService';
import ProviderCard from './ProviderCard';

const CRMPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editProviderId, setEditProviderId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    tel: '',
    mail: '',
    website: '',
    type: 'Entreprise' as 'Personnel' | 'Entreprise'
  });

  const loadProviders = async () => {
    const data = await getProviders();
    setProviders(data);
  };

  useEffect(() => {
    loadProviders();
  }, []);

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

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProviders.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    const confirmDelete = window.confirm(`Voulez-vous supprimer ${selectedIds.length} fournisseur(s) ?`);
    if (confirmDelete) {
      const updated = providers.filter(p => !selectedIds.includes(p.id));
      setProviders(updated);
      saveProviders(updated);
      setSelectedIds([]);
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setFormData({
      name: provider.name,
      company: provider.company,
      tel: provider.tel,
      mail: provider.mail,
      website: provider.website || '',
      type: provider.type
    });
    setEditProviderId(provider.id);
    setShowAddModal(true);
  };

  const handleDeleteProvider = (id: number) => {
    const confirmDelete = window.confirm('Supprimer ce fournisseur ?');
    if (confirmDelete) {
      const updated = providers.filter(p => p.id !== id);
      setProviders(updated);
      saveProviders(updated);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', company: '', tel: '', mail: '', website: '', type: 'Entreprise' });
    setEditProviderId(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let normalizedWebsite = formData.website.trim();
    if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
      normalizedWebsite = `https://${normalizedWebsite}`;
    }
    const finalFormData = { ...formData, website: normalizedWebsite };

    if (editProviderId) {
      const updated = providers.map(p => p.id === editProviderId ? { ...p, ...finalFormData } : p);
      setProviders(updated);
      await saveProviders(updated);
    } else {
      await addProvider(finalFormData);
      await loadProviders();
    }
    setShowAddModal(false);
    setEditProviderId(null);
    setSelectedIds([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Fournisseurs</h1>
        <p className="text-[#667085] font-medium">Gérez votre carnet d'adresses et contacts industriels</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Rechercher un fournisseur..." 
            className="w-full h-11 pl-11 pr-4 bg-white border border-[#D0D5DD] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#007a8c] focus:border-[#007a8c] shadow-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden md:flex bg-white border border-[#D0D5DD] rounded-xl p-1 shadow-sm shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#F2F4F7] text-[#101828]' : 'text-[#667085] hover:text-[#101828]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#F2F4F7] text-[#101828]' : 'text-[#667085] hover:text-[#101828]'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none h-11 px-5 bg-white border border-[#D0D5DD] text-[#344054] text-sm font-bold rounded-xl hover:bg-[#F9FAFB] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none h-11 px-5 bg-[#007a8c] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Ajouter
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {selectedIds.length > 0 && (
          <div className="mb-6 flex items-center justify-between p-4 bg-[#F0F9FA] rounded-xl border border-[#CCEEF2] animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-bold text-[#007a8c]">{selectedIds.length} sélectionné(s)</span>
            <div className="flex gap-2">
               {selectedIds.length === 1 && (
                 <button onClick={() => {
                   const provider = providers.find(p => p.id === selectedIds[0]);
                   if(provider) handleEditProvider(provider);
                 }} className="px-3 py-1.5 text-xs font-bold text-[#007a8c] hover:underline uppercase tracking-wider">Modifier</button>
               )}
               <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:underline uppercase tracking-wider">Supprimer</button>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProviders.map(p => (
              <div key={p.id} className="relative">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(p.id)}
                  onChange={() => handleToggleSelect(p.id)}
                  className="absolute top-4 right-4 z-10 w-5 h-5 rounded border-gray-300 text-[#007a8c] focus:ring-[#007a8c] transition-all opacity-0 group-hover:opacity-100 peer"
                  style={{ opacity: selectedIds.includes(p.id) ? 1 : undefined }}
                />
                <ProviderCard 
                  provider={p} 
                  onEdit={handleEditProvider} 
                  onDelete={handleDeleteProvider} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
            <table className="table table-zebra w-full text-left">
              <thead className="bg-[#F9FAFB] text-[#667085] text-xs uppercase font-bold border-b">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredProviders.length && filteredProviders.length > 0} className="rounded border-gray-300 text-[#007a8c] focus:ring-[#007a8c]" />
                  </th>
                  <th className="px-6 py-4">Société</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredProviders.map(p => (
                  <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => handleToggleSelect(p.id)} className="rounded border-gray-300 text-[#007a8c] focus:ring-[#007a8c]" />
                    </td>
                    <td className="px-6 py-4 font-bold text-[#101828]">{p.company}</td>
                    <td className="px-6 py-4 text-[#475467]">{p.name}</td>
                    <td className="px-6 py-4 font-semibold">{p.tel}</td>
                    <td className="px-6 py-4 text-[#007a8c]">{p.mail}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditProvider(p)} className="text-[#007a8c] font-bold mr-4 hover:underline">Modifier</button>
                      <button onClick={() => handleDeleteProvider(p.id)} className="text-red-600 font-bold hover:underline">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredProviders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-[#EAECF0] rounded-2xl">
            <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#98A2B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="text-sm font-bold text-[#101828]">Aucun fournisseur trouvé</p>
            <p className="text-xs text-[#667085] mt-1">Essayez d'ajuster votre recherche ou d'ajouter un nouveau contact.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden border border-[#EAECF0] animate-in zoom-in duration-200">
            <div className="p-6 border-b border-[#EAECF0] bg-[#F9FAFB] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#101828]">{editProviderId ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Société / Entreprise</label>
                <input required type="text" className="w-full h-11 px-4 bg-white border border-[#D0D5DD] rounded-xl text-sm" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Nom de l'entreprise" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#344054]">Contact</label>
                  <input required type="text" className="w-full h-11 px-4 border border-[#D0D5DD] rounded-xl text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nom complet" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-[#344054]">Téléphone</label>
                  <input required type="tel" className="w-full h-11 px-4 border border-[#D0D5DD] rounded-xl text-sm" value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} placeholder="+216 ..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Email professionnel</label>
                <input required type="email" className="w-full h-11 px-4 border border-[#D0D5DD] rounded-xl text-sm" value={formData.mail} onChange={e => setFormData({...formData, mail: e.target.value})} placeholder="contact@entreprise.tn" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#344054]">Site Web (Optionnel)</label>
                <input type="text" className="w-full h-11 px-4 border border-[#D0D5DD] rounded-xl text-sm" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="www.exemple.tn" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-12 bg-white border border-[#D0D5DD] text-[#344054] font-bold rounded-xl hover:bg-[#F9FAFB] transition-all">Annuler</button>
                <button type="submit" className="flex-1 h-12 bg-[#007a8c] text-white font-bold rounded-xl shadow-lg hover:bg-[#006675] transition-all active:scale-[0.98]">
                  {editProviderId ? 'Mettre à jour' : 'Créer Contact'}
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
