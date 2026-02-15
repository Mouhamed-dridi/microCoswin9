import React, { useState, useEffect } from 'react';

interface MaintenanceRequest {
    id: string;
    date: string;
    time: string;
    machineId: string;
    assignedTechnicians: string[]; // IDs
}

const MaintenanceRequestPage: React.FC = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [machines, setMachines] = useState<any[]>([]);
    const [team, setTeam] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        machineId: '',
        tempTechId: ''
    });

    const fetchData = async () => {
        try {
            const [reqRes, machRes, teamRes] = await Promise.all([
                fetch('/api/maintenanceRequests'),
                fetch('/api/machines'),
                fetch('/api/maintenanceTeam')
            ]);
            const [reqData, machData, teamData] = await Promise.all([
                reqRes.json(),
                machRes.json(),
                teamRes.json()
            ]);
            setRequests(reqData);
            setMachines(machData.filter((m: any) => !Array.isArray(m))); // Filter out nested arrays if any
            setTeam(teamData);
        } catch (err) {
            console.error("Fetch failed", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddTechnician = () => {
        if (formData.tempTechId && !selectedTechnicians.includes(formData.tempTechId)) {
            setSelectedTechnicians([...selectedTechnicians, formData.tempTechId]);
            setFormData({ ...formData, tempTechId: '' });
        }
    };

    const handleRemoveTechnician = (id: string) => {
        setSelectedTechnicians(selectedTechnicians.filter(t => t !== id));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.time || !formData.machineId || selectedTechnicians.length === 0) {
            alert("Veuillez remplir tous les champs et ajouter au moins un technicien.");
            return;
        }

        const payload = {
            date: formData.date,
            time: formData.time,
            machineId: formData.machineId,
            assignedTechnicians: selectedTechnicians
        };

        try {
            const res = await fetch('/api/maintenanceRequests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ date: '', time: '', machineId: '', tempTechId: '' });
                setSelectedTechnicians([]);
                fetchData();
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer cette planification ?")) return;
        try {
            const res = await fetch(`/api/maintenanceRequests/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const getMachineName = (id: string) => machines.find(m => m.id === id)?.nameOrCode || 'Inconnue';
    const getTechName = (id: string) => team.find(t => t.id === id)?.name || 'Inconnu';

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#FCFCFD]">
            <div className="mb-8 flex justify-between items-center px-4 pt-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#101828]">Planification Maintenance</h1>
                    <p className="text-[#667085] text-sm">Gérez et suivez les interventions prévues.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="h-10 px-4 bg-[#007a8c] text-white rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Planifier une maintenance
                </button>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-8">
                {requests.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center bg-white border border-dashed border-[#EAECF0] rounded-xl">
                        <div className="w-12 h-12 bg-[#F2F4F7] rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-[#667085]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <p className="text-[#101828] font-medium">Aucune maintenance planifiée</p>
                        <p className="text-[#667085] text-sm">Commencez par planifier une intervention.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(req => (
                            <div key={req.id} className="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                                <button onClick={() => handleDelete(req.id)} className="absolute top-4 right-4 text-[#FDA29B] hover:text-[#B42318] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-[#ECFDF3] rounded-lg flex items-center justify-center text-[#027A48]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#101828]">{getMachineName(req.machineId)}</h3>
                                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#027a48] border border-[#ABEFC6]">Scheduled</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-[#475467]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(req.date).toLocaleDateString()} à {req.time}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {req.assignedTechnicians.map(techId => (
                                            <span key={techId} className="px-2.5 py-1 bg-[#F2F4F7] text-[#344054] text-xs font-medium rounded-md flex items-center gap-1.5 border border-[#EAECF0]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#101828]"></div>
                                                {getTechName(techId)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#EAECF0] flex justify-between items-center bg-[#F9FAFB]">
                            <h3 className="text-lg font-bold text-[#101828]">Planifier une maintenance</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#667085] hover:text-[#101828] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#475467] uppercase tracking-wider">Date *</label>
                                    <input type="date" required className="input input-bordered w-full h-11 text-sm rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-[#475467] uppercase tracking-wider">Heure *</label>
                                    <input type="time" required className="input input-bordered w-full h-11 text-sm rounded-lg" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#475467] uppercase tracking-wider">Machine *</label>
                                <select required className="select select-bordered w-full h-11 text-sm rounded-lg" value={formData.machineId} onChange={e => setFormData({ ...formData, machineId: e.target.value })}>
                                    <option value="">Sélectionner une machine</option>
                                    {machines.map(m => (
                                        <option key={m.id} value={m.id}>{m.nameOrCode} ({m.location})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-[#475467] uppercase tracking-wider">Techniciens *</label>
                                <div className="flex gap-2">
                                    <select className="select select-bordered flex-1 h-11 text-sm rounded-lg" value={formData.tempTechId} onChange={e => setFormData({ ...formData, tempTechId: e.target.value })}>
                                        <option value="">Ajouter un technicien</option>
                                        {team.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.specialite})</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={handleAddTechnician} className="h-11 px-4 bg-[#F2F4F7] text-[#344054] font-bold rounded-lg border border-[#D0D5DD] hover:bg-[#EAECF0]">Ajouter</button>
                                </div>
                            </div>

                            {selectedTechnicians.length > 0 && (
                                <div className="bg-[#F9FAFB] p-3 rounded-xl border border-[#EAECF0] flex flex-wrap gap-2">
                                    {selectedTechnicians.map(id => (
                                        <div key={id} className="bg-white px-2 py-1 rounded-md text-xs font-bold border border-[#D0D5DD] flex items-center gap-2 text-[#344054]">
                                            {getTechName(id)}
                                            <button type="button" onClick={() => handleRemoveTechnician(id)} className="text-[#FDA29B] hover:text-[#B42318] flex items-center">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-11 border border-[#D0D5DD] rounded-xl text-sm font-bold text-[#344054] hover:bg-gray-50 uppercase tracking-widest">Annuler</button>
                                <button type="submit" className="flex-1 h-11 bg-[#007a8c] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#007a8c]/20 hover:bg-[#00697a] uppercase tracking-widest">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceRequestPage;
