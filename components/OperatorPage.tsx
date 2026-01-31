
import React, { useState, useRef } from 'react';
import { User, ProblemType, LocationType, UrgencyLevel } from '../types';
import { addTicket } from '../services/database';

interface OperatorPageProps {
  user: User;
}

const OperatorPage: React.FC<OperatorPageProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    machine: '',
    location: '' as unknown as LocationType,
    type: 'Mechanical' as ProblemType,
    urgency: 'Medium' as UrgencyLevel,
    description: '',
    reporter: user.username,
    operatorName: '',
    matricule: '',
    image: null as string | null
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: string[] = [];
    if (!formData.operatorName.trim()) newErrors.push("Operator Identity is required.");
    if (!formData.matricule.trim()) newErrors.push("Matricule Registration ID is required.");
    if (!formData.machine.trim()) newErrors.push("Asset ID / Machine name is required.");
    if (!formData.location) newErrors.push("Operational Zone selection is required.");
    if (formData.description.trim().length < 10) {
      newErrors.push("Problem description requires more detail (min 10 chars).");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addTicket(formData as any);
    setShowToast(true);
    setErrors([]);
    setFormData({ machine: '', location: '' as unknown as LocationType, type: 'Mechanical', urgency: 'Medium', description: '', reporter: user.username, operatorName: '', matricule: '', image: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setShowToast(false), 3000);
  };

  const SectionTitle = ({ num, title }: { num: string, title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">{num}</div>
      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 leading-none">Maintenance Report</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Log a technical breakdown for rapid response deployment</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
        <div className="bg-slate-50 dark:bg-slate-800/50 px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Formal Request Document</span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12">
          <section>
            <SectionTitle num="01" title="Operator Credentials" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Operator</label>
                <input type="text" placeholder="Full name" className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" value={formData.operatorName} onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Matricule ID</label>
                <input type="text" placeholder="e.g. MX-4092" className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" value={formData.matricule} onChange={(e) => setFormData({ ...formData, matricule: e.target.value })} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle num="02" title="Asset & Environment" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Machine Identity</label>
                <input type="text" placeholder="Asset Serial / Name" className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" value={formData.machine} onChange={(e) => setFormData({ ...formData, machine: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Zone / Facility</label>
                <select className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value as LocationType })}>
                  <option value="" disabled>Select physical location</option>
                  <option value="Zone 1">Zone 1 - Main Floor</option>
                  <option value="Zone 2">Zone 2 - Assembly</option>
                  <option value="Zone 3">Zone 3 - Packaging</option>
                  <option value="Other">External Facilities</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle num="03" title="Incident Particulars" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Failure Mode</label>
                <select className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Sensor">Sensor / PLC</option>
                  <option value="Hydraulic">Hydraulic</option>
                  <option value="Other">Miscellaneous</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Operational Impact</label>
                <select className={`w-full h-14 px-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all ${formData.urgency.includes('Critical') ? 'text-red-600 border-red-100' : ''}`} value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}>
                  <option value="Low">Low - Non-Blocking</option>
                  <option value="Medium">Medium - Reduced Speed</option>
                  <option value="High">High - Major Fault</option>
                  <option value="Critical – line stopped">CRITICAL - Total Stoppage</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Detailed Technical Report</label>
              <textarea className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all resize-none" placeholder="Describe specific symptoms, error codes, and preceding events..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
            </div>
          </section>

          {errors.length > 0 && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
              <ul className="list-disc list-inside text-xs text-red-600 font-bold space-y-1.5">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl text-[15px] font-black shadow-2xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              Submit Record to Master Log
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            Transaction Verified & Logged
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorPage;
