
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AppUser, Group } from '../types';

const USERS_KEY = 'users';
const GROUPS_KEY = 'groups';
const MACHINES_KEY = 'machines';
const MAINTENANCE_TEAM_KEY = 'maintenanceTeam';

const GroupesUtilisateursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'machines' | 'maintenance'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [maintenanceTeam, setMaintenanceTeam] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const loadAll = () => {
    const u = localStorage.getItem(USERS_KEY);
    setUsers(u ? JSON.parse(u) : []);
    const g = localStorage.getItem(GROUPS_KEY);
    setGroups(g ? JSON.parse(g) : []);
    const m = localStorage.getItem(MACHINES_KEY);
    setMachines(m ? JSON.parse(m) : []);
    const mt = localStorage.getItem(MAINTENANCE_TEAM_KEY);
    setMaintenanceTeam(mt ? JSON.parse(mt) : []);
  };

  useEffect(() => { loadAll(); }, []);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    // Ensure default status for users
    const newItem = { ...formData, id, status: formData.status || 'Actif' };

    let key = '';
    let currentItems: any[] = [];
    let setter: any = null;

    if (activeTab === 'users') { key = USERS_KEY; currentItems = users; setter = setUsers; }
    else if (activeTab === 'groups') { key = GROUPS_KEY; currentItems = groups; setter = setGroups; }
    else if (activeTab === 'machines') { key = MACHINES_KEY; currentItems = machines; setter = setMachines; }
    else { key = MAINTENANCE_TEAM_KEY; currentItems = maintenanceTeam; setter = setMaintenanceTeam; }

    const updated = [...currentItems, newItem];
    localStorage.setItem(key, JSON.stringify(updated));
    setter(updated);
    setShowModal(false);
    setFormData({});
  };

  const deleteItem = (key: string, id: string, items: any[], setter: (val: any[]) => void) => {
    if (confirm('Supprimer cet élément ?')) {
      const updated = items.filter(i => i.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setter(updated);
    }
  };

  const handleExportMachines = () => {
    const headers = ['ID', 'Nom Machine', 'Fournisseur'];
    const rows = machines.map(m => [m.id, m.machineName, m.vendor]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Machines");
    XLSX.writeFile(wb, "machines_export.xlsx");
  };

  const getButtonText = () => {
    if (activeTab === 'users') return "+ Ajouter utilisateur";
    if (activeTab === 'machines') return "+ Créer une machine";
    if (activeTab === 'maintenance') return "+ Créer un technicien";
    return "+ Ajouter groupe";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6">
      <div className="mb-8 shrink-0">
        <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Groupes et Utilisateurs</h1>
        <p className="text-[#667085] font-medium">Gérez les accès et l'organisation de votre équipe</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 overflow-hidden flex-1">
        <div className="lg:w-64 shrink-0">
          <ul className="menu bg-white border border-[#EAECF0] rounded-xl p-2 shadow-sm font-semibold">
            <li><button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'bg-[#007a8c] text-white' : ''}>Utilisateurs</button></li>
            <li><button onClick={() => setActiveTab('groups')} className={activeTab === 'groups' ? 'bg-[#007a8c] text-white' : ''}>Groupes</button></li>
            <li><button onClick={() => setActiveTab('machines')} className={activeTab === 'machines' ? 'bg-[#007a8c] text-white' : ''}>Machines</button></li>
            <li><button onClick={() => setActiveTab('maintenance')} className={activeTab === 'maintenance' ? 'bg-[#007a8c] text-white' : ''}>Maintenance</button></li>
          </ul>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#101828] capitalize">{activeTab}</h2>
              <div className="flex gap-2">
                {activeTab === 'machines' && (
                  <button onClick={handleExportMachines} className="btn btn-sm h-10 bg-white border border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] px-4 font-bold shadow-sm">
                    Exporter Excel
                  </button>
                )}
                <button onClick={() => setShowModal(true)} className="btn btn-sm h-10 bg-[#007a8c] text-white border-none px-4 font-bold shadow-sm">
                  {getButtonText()}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm">
                <thead className="bg-[#F9FAFB] text-[#667085] text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Nom / Libellé</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'users' && users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{u.name}</div>
                        <div className="text-xs text-[#667085]">{u.role} - {u.group}</div>
                      </td>
                      <td className="px-6 py-4 text-right"><button onClick={() => deleteItem(USERS_KEY, u.id, users, setUsers)} className="text-red-600 font-bold">Supprimer</button></td>
                    </tr>
                  ))}
                  {activeTab === 'groups' && groups.map(g => (
                    <tr key={g.id}>
                      <td className="px-6 py-4 font-bold">{g.name}</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => deleteItem(GROUPS_KEY, g.id, groups, setGroups)} className="text-red-600 font-bold">Supprimer</button></td>
                    </tr>
                  ))}
                  {activeTab === 'machines' && machines.map(m => (
                    <tr key={m.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{m.machineName}</div>
                        <div className="text-xs text-[#667085]">{m.vendor}</div>
                      </td>
                      <td className="px-6 py-4 text-right"><button onClick={() => deleteItem(MACHINES_KEY, m.id, machines, setMachines)} className="text-red-600 font-bold">Supprimer</button></td>
                    </tr>
                  ))}
                  {activeTab === 'maintenance' && maintenanceTeam.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold">{t.fullName}</div>
                        <div className="text-xs text-[#667085]">{t.group} - {t.tel}</div>
                      </td>
                      <td className="px-6 py-4 text-right"><button onClick={() => deleteItem(MAINTENANCE_TEAM_KEY, t.id, maintenanceTeam, setMaintenanceTeam)} className="text-red-600 font-bold">Supprimer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Logic-driven Modal Forms */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#EAECF0]">
            <div className="p-6 border-b border-[#EAECF0] bg-[#F9FAFB]">
               <h3 className="text-lg font-bold">Ajouter un élément ({activeTab})</h3>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              {activeTab === 'users' && (
                <>
                  <input required placeholder="Nom complet" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required placeholder="Login" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, login: e.target.value})} />
                  <select className="select select-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="">Sélectionner Rôle</option>
                    <option value="Operator">Opérateur</option>
                    <option value="Manager">Manager</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  <input placeholder="Groupe (ex: Equipe A)" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, group: e.target.value})} />
                </>
              )}
              {activeTab === 'groups' && (
                <input required placeholder="Nom du groupe" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, name: e.target.value})} />
              )}
              {activeTab === 'machines' && (
                <>
                  <input required placeholder="Nom de la machine" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, machineName: e.target.value})} />
                  <input required placeholder="Fournisseur / Fabricant" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, vendor: e.target.value})} />
                </>
              )}
              {activeTab === 'maintenance' && (
                <>
                  <input required placeholder="Nom complet" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  <input required placeholder="Téléphone" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, tel: e.target.value})} />
                  <input required placeholder="Spécialité (Hydro, Elec, PLC)" className="input input-bordered w-full text-sm h-11" onChange={e => setFormData({...formData, group: e.target.value})} />
                </>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost font-bold">Annuler</button>
                <button type="submit" className="btn bg-[#007a8c] text-white font-bold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupesUtilisateursPage;
