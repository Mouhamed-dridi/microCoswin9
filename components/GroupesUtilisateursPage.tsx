
import React, { useState, useEffect, useMemo } from 'react';
import { AppUser, Group, UserRole, UserStatus } from '../types';

const USERS_KEY = 'capitalone_users';
const GROUPS_KEY = 'capitalone_groups';
const MACHINES_KEY = 'machines';

const defaultGroups: Group[] = [
  { id: '1', name: 'Admin', description: 'Accès total au système' },
  { id: '2', name: 'Operators', description: 'Personnel de production' },
  { id: '3', name: 'Maintenance Team', description: 'Techniciens de maintenance' },
];

const defaultUsers: AppUser[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    login: 'admin@capitalone.tn', 
    telWhatsapp: '+216 00 000 000',
    role: 'Manager', 
    group: 'Admin', 
    status: 'Actif' 
  }
];

interface Machine {
  id: string;
  machineName: string;
  vendor: string;
  dateAchat: string;
  numFacture: string;
  type: 'Hydraulic' | 'Press' | 'Other Electronic';
  otherType?: string;
}

const GroupesUtilisateursPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'machines'>('users');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);
  
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form states
  const [userForm, setUserForm] = useState<Omit<AppUser, 'id'>>({
    name: '',
    login: '',
    telWhatsapp: '',
    role: 'Operator',
    group: 'Operators',
    status: 'Actif',
    password: ''
  });

  const [groupForm, setGroupForm] = useState<Omit<Group, 'id'>>({
    name: '',
    description: ''
  });

  const [machineForm, setMachineForm] = useState<Omit<Machine, 'id'>>({
    machineName: '',
    vendor: '',
    dateAchat: '',
    numFacture: '',
    type: 'Hydraulic',
    otherType: ''
  });

  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedGroups = localStorage.getItem(GROUPS_KEY);
    const storedMachines = localStorage.getItem(MACHINES_KEY);

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(defaultUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    } else {
      setGroups(defaultGroups);
      localStorage.setItem(GROUPS_KEY, JSON.stringify(defaultGroups));
    }

    if (storedMachines) {
      setMachines(JSON.parse(storedMachines));
    } else {
      setMachines([]);
    }
  }, []);

  const saveUsers = (newUsers: AppUser[]) => {
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  };

  const saveGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(newGroups));
  };

  const saveMachines = (newMachines: Machine[]) => {
    setMachines(newMachines);
    localStorage.setItem(MACHINES_KEY, JSON.stringify(newMachines));
  };

  const resetUserForm = () => {
    setUserForm({ 
      name: '', 
      login: '', 
      telWhatsapp: '',
      role: 'Operator', 
      group: 'Operators', 
      status: 'Actif', 
      password: '' 
    });
  };

  const resetMachineForm = () => {
    setMachineForm({
      machineName: '',
      vendor: '',
      dateAchat: '',
      numFacture: '',
      type: 'Hydraulic',
      otherType: ''
    });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u);
      saveUsers(updated);
    } else {
      const newUser: AppUser = { ...userForm, id: Date.now().toString() };
      saveUsers([...users, newUser]);
    }
    setShowUserModal(false);
    setEditingUser(null);
    resetUserForm();
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      const updated = groups.map(g => g.id === editingGroup.id ? { ...g, ...groupForm } : g);
      saveGroups(updated);
    } else {
      const newGroup: Group = { ...groupForm, id: Date.now().toString() };
      saveGroups([...groups, newGroup]);
    }
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupForm({ name: '', description: '' });
  };

  const handleMachineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMachine) {
      const updated = machines.map(m => m.id === editingMachine.id ? { ...m, ...machineForm } : m);
      saveMachines(updated);
    } else {
      const newMachine: Machine = { ...machineForm, id: Date.now().toString() };
      saveMachines([...machines, newMachine]);
    }
    setShowMachineModal(false);
    setEditingMachine(null);
    resetMachineForm();
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  const deleteGroup = (id: string) => {
    if (window.confirm('Supprimer ce groupe ?')) {
      saveGroups(groups.filter(g => g.id !== id));
    }
  };

  const deleteMachine = (id: string) => {
    if (window.confirm('Supprimer cette machine ?')) {
      saveMachines(machines.filter(m => m.id !== id));
    }
  };

  const openEditUser = (u: AppUser) => {
    setEditingUser(u);
    setUserForm({ 
      name: u.name,
      login: u.login,
      telWhatsapp: u.telWhatsapp || '',
      role: u.role,
      group: u.group,
      status: u.status,
      password: u.password || ''
    });
    setShowUserModal(true);
  };

  const openEditGroup = (g: Group) => {
    setEditingGroup(g);
    setGroupForm({ ...g });
    setShowGroupModal(true);
  };

  const openEditMachine = (m: Machine) => {
    setEditingMachine(m);
    setMachineForm({ ...m });
    setShowMachineModal(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-8 shrink-0">
        <h1 className="text-[30px] font-bold text-[#101828] tracking-tight">Groupes et Utilisateurs</h1>
        <p className="text-[#667085] font-medium">Gérez les accès et l'organisation de votre équipe</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 overflow-hidden flex-1">
        {/* Navigation Interne */}
        <div className="lg:w-64 shrink-0">
          <ul className="menu bg-white border border-[#EAECF0] rounded-xl p-2 shadow-sm font-semibold">
            <li>
              <button 
                onClick={() => setActiveTab('users')}
                className={activeTab === 'users' ? 'bg-[#007a8c] text-white' : 'text-[#667085]'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Utilisateurs
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('groups')}
                className={activeTab === 'groups' ? 'bg-[#007a8c] text-white' : 'text-[#667085]'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Groupes
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('machines')}
                className={activeTab === 'machines' ? 'bg-[#007a8c] text-white' : 'text-[#667085]'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Machines
              </button>
            </li>
          </ul>
        </div>

        {/* Zone de Contenu */}
        <div className="flex-1 overflow-y-auto pr-2 pb-8">
          {activeTab === 'users' ? (
            <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#EAECF0] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#101828]">Liste des Utilisateurs</h2>
                <button 
                  onClick={() => { setEditingUser(null); resetUserForm(); setShowUserModal(true); }}
                  className="btn btn-sm h-10 bg-[#007a8c] hover:bg-[#006675] text-white border-none normal-case px-4"
                >
                  + Ajouter un utilisateur
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="text-[#667085] text-xs uppercase">
                      <th className="px-6 py-4 text-left">Utilisateur / Login</th>
                      <th className="px-6 py-4 text-left">Contact</th>
                      <th className="px-6 py-4 text-left">Rôle & Groupe</th>
                      <th className="px-6 py-4 text-left">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#101828]">{user.name}</div>
                          <div className="text-xs text-[#667085] font-mono">{user.login}</div>
                        </td>
                        <td className="px-6 py-4 text-[#667085] font-medium">
                          {user.telWhatsapp || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                              user.role === 'Manager' ? 'border-blue-200 text-blue-700 bg-blue-50' : 
                              user.role === 'Maintenance' ? 'border-orange-200 text-orange-700 bg-orange-50' : 
                              'border-gray-200 text-gray-700 bg-gray-50'
                            }`}>
                              {user.role}
                            </span>
                            <span className="text-xs text-[#667085]">{user.group}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`badge badge-sm font-bold ${user.status === 'Actif' ? 'badge-success text-white' : 'badge-ghost text-gray-400'}`}>
                            {user.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEditUser(user)} className="text-[#007a8c] hover:underline font-bold">Modifier</button>
                          <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline font-bold">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'groups' ? (
            <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#EAECF0] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#101828]">Liste des Groupes</h2>
                <button 
                  onClick={() => { setEditingGroup(null); setGroupForm({name:'', description:''}); setShowGroupModal(true); }}
                  className="btn btn-sm h-10 bg-[#007a8c] hover:bg-[#006675] text-white border-none normal-case px-4"
                >
                  + Créer un groupe
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="text-[#667085] text-xs uppercase">
                      <th className="px-6 py-4">Nom du groupe</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Utilisateurs</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {groups.map(group => (
                      <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#101828]">{group.name}</td>
                        <td className="px-6 py-4 text-[#667085] max-w-xs truncate">{group.description}</td>
                        <td className="px-6 py-4">
                          <span className="badge badge-ghost font-bold">
                            {users.filter(u => u.group === group.name).length}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEditGroup(group)} className="text-[#007a8c] hover:underline font-bold">Modifier</button>
                          <button onClick={() => deleteGroup(group.id)} className="text-red-600 hover:underline font-bold">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#EAECF0] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#101828]">Liste des Machines</h2>
                <button 
                  onClick={() => { setEditingMachine(null); resetMachineForm(); setShowMachineModal(true); }}
                  className="btn btn-sm h-10 bg-[#007a8c] hover:bg-[#006675] text-white border-none normal-case px-4"
                >
                  + Créer une machine
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr className="text-[#667085] text-xs uppercase">
                      <th className="px-6 py-4">Nom de machine</th>
                      <th className="px-6 py-4">Fournisseur</th>
                      <th className="px-6 py-4">Date d'achat</th>
                      <th className="px-6 py-4">Num Facture</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {machines.map(machine => (
                      <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#101828]">{machine.machineName}</td>
                        <td className="px-6 py-4 text-[#667085] font-medium">{machine.vendor}</td>
                        <td className="px-6 py-4 text-[#667085]">{machine.dateAchat}</td>
                        <td className="px-6 py-4 text-[#667085]">{machine.numFacture}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#344054] text-xs font-semibold">
                            {machine.type === 'Other Electronic' ? machine.otherType : machine.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => openEditMachine(machine)} className="text-[#007a8c] hover:underline font-bold">Modifier</button>
                          <button onClick={() => deleteMachine(machine.id)} className="text-red-600 hover:underline font-bold">Supprimer</button>
                        </td>
                      </tr>
                    ))}
                    {machines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-[#667085]">
                          Aucune machine enregistrée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Improved User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101828]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] border border-[#EAECF0] overflow-hidden">
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <h2 className="text-xl font-bold text-[#101828]">{editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-[#667085] hover:text-[#101828]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-8 space-y-5">
              {/* 1. Login Fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">
                    Login / Identifiant <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="email@company.tn ou username"
                    className="input input-bordered w-full h-11" 
                    value={userForm.login} 
                    onChange={e => setUserForm({...userForm, login: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">
                    Mot de passe <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input 
                    required={!editingUser} 
                    type="password" 
                    placeholder="••••••••" 
                    className="input input-bordered w-full h-11" 
                    value={userForm.password} 
                    onChange={e => setUserForm({...userForm, password: e.target.value})} 
                  />
                </div>
              </div>

              {/* 2. Info Fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Nom complet</label>
                  <input 
                    type="text" 
                    placeholder="Mohamed Trabelsi"
                    className="input input-bordered w-full h-11" 
                    value={userForm.name} 
                    onChange={e => setUserForm({...userForm, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Téléphone / WhatsApp</label>
                  <input 
                    type="text" 
                    placeholder="+216 98 123 456"
                    className="input input-bordered w-full h-11" 
                    value={userForm.telWhatsapp} 
                    onChange={e => setUserForm({...userForm, telWhatsapp: e.target.value})} 
                  />
                </div>
              </div>

              {/* 3. Assignment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Rôle</label>
                  <select 
                    className="select select-bordered w-full h-11 min-h-[44px]" 
                    value={userForm.role} 
                    onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}
                  >
                    <option value="Operator">Operator</option>
                    <option value="Manager">Manager</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Groupe</label>
                  <select 
                    className="select select-bordered w-full h-11 min-h-[44px]" 
                    value={userForm.group} 
                    onChange={e => setUserForm({...userForm, group: e.target.value})}
                  >
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={userForm.status === 'Actif'} 
                  onChange={e => setUserForm({...userForm, status: e.target.checked ? 'Actif' : 'Inactif'})} 
                  id="status-toggle" 
                />
                <label htmlFor="status-toggle" className="text-gray-700 font-medium text-sm cursor-pointer">Compte Actif</label>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-ghost normal-case text-gray-500">Annuler</button>
                <button type="submit" className="btn bg-[#007a8c] text-white hover:bg-[#006675] border-none normal-case px-10">
                  {editingUser ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Machine */}
      {showMachineModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101828]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] border border-[#EAECF0] overflow-hidden">
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <h2 className="text-xl font-bold text-[#101828]">{editingMachine ? 'Modifier Machine' : 'Nouvelle Machine'}</h2>
              <button onClick={() => setShowMachineModal(false)} className="text-[#667085] hover:text-[#101828]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleMachineSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-gray-700 font-medium text-sm block">Nom de Machine <span className="text-red-500 font-bold">*</span></label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. G33"
                  className="input input-bordered w-full h-11" 
                  value={machineForm.machineName} 
                  onChange={e => setMachineForm({...machineForm, machineName: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 font-medium text-sm block">Fournisseur (Vendor) <span className="text-red-500 font-bold">*</span></label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. MicroIndust"
                  className="input input-bordered w-full h-11" 
                  value={machineForm.vendor} 
                  onChange={e => setMachineForm({...machineForm, vendor: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Date d'Achat <span className="text-red-500 font-bold">*</span></label>
                  <input 
                    required 
                    type="date" 
                    className="input input-bordered w-full h-11" 
                    value={machineForm.dateAchat} 
                    onChange={e => setMachineForm({...machineForm, dateAchat: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Num Facture <span className="text-red-500 font-bold">*</span></label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. FACT-1234"
                    className="input input-bordered w-full h-11" 
                    value={machineForm.numFacture} 
                    onChange={e => setMachineForm({...machineForm, numFacture: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-gray-700 font-medium text-sm block">Type <span className="text-red-500 font-bold">*</span></label>
                <select 
                  className="select select-bordered w-full h-11 min-h-[44px]" 
                  value={machineForm.type} 
                  onChange={e => setMachineForm({...machineForm, type: e.target.value as any})}
                  required
                >
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="Press">Press</option>
                  <option value="Other Electronic">Other Electronic</option>
                </select>
              </div>
              {machineForm.type === 'Other Electronic' && (
                <div className="space-y-1">
                  <label className="text-gray-700 font-medium text-sm block">Specify other type <span className="text-red-500 font-bold">*</span></label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Specify other type"
                    className="input input-bordered w-full h-11" 
                    value={machineForm.otherType} 
                    onChange={e => setMachineForm({...machineForm, otherType: e.target.value})} 
                  />
                </div>
              )}

              <div className="pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowMachineModal(false)} className="btn btn-ghost normal-case text-gray-500">Annuler</button>
                <button type="submit" className="btn bg-[#007a8c] text-white hover:bg-[#006675] border-none normal-case px-10">
                  {editingMachine ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Groupe */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101828]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] border border-[#EAECF0] overflow-hidden">
            <div className="p-6 border-b border-[#EAECF0] flex items-center justify-between bg-[#F9FAFB]">
              <h2 className="text-xl font-bold text-[#101828]">{editingGroup ? 'Modifier Groupe' : 'Nouveau Groupe'}</h2>
              <button onClick={() => setShowGroupModal(false)} className="text-[#667085] hover:text-[#101828]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleGroupSubmit} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-[#344054]">Nom du groupe</label>
                <input required type="text" className="input input-bordered w-full" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-[#344054]">Description</label>
                <textarea className="textarea textarea-bordered w-full h-24" value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} />
              </div>
              <div className="pt-6 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowGroupModal(false)} className="btn btn-ghost normal-case">Annuler</button>
                <button type="submit" className="btn bg-[#007a8c] text-white hover:bg-[#006675] border-none normal-case px-8">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupesUtilisateursPage;
