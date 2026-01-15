
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { KeyRound, ShieldCheck, UserCircle, Briefcase, Car } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.DELEGATE);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let user: User | undefined;
    if (selectedRole === UserRole.MANAGER) {
      user = users.find(u => u.role === UserRole.MANAGER && u.code === code);
    } else {
      user = users.find(u => u.id === selectedUserId && u.code === code);
    }
    if (user) {
      onLogin(user);
    } else {
      setError('الكود المدخل غير صحيح، حاول مجدداً');
    }
  };

  const filteredUsers = users.filter(u => u.role === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col justify-center px-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200/30 blur-[120px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-100/30 blur-[150px] rounded-full" />

      <div className="w-full max-w-sm mx-auto bg-white/70 backdrop-blur-2xl p-8 rounded-[3rem] shadow-2xl border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-black mb-6 shadow-2xl shadow-indigo-200 animate-in slide-in-from-top-4">
            MB
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">محفظة وبداعة</h2>
          <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">الجيل الثالث لنظام الإدارة</p>
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-[1.8rem] mb-8 border border-slate-100 shadow-inner">
          <RoleButton icon={<Briefcase size={14}/>} role={UserRole.DELEGATE} current={selectedRole} onClick={() => {setSelectedRole(UserRole.DELEGATE); setSelectedUserId('');}} label="مندوب" />
          <RoleButton icon={<Car size={14}/>} role={UserRole.DRIVER} current={selectedRole} onClick={() => {setSelectedRole(UserRole.DRIVER); setSelectedUserId('');}} label="سائق" />
          <RoleButton icon={<ShieldCheck size={14}/>} role={UserRole.MANAGER} current={selectedRole} onClick={() => {setSelectedRole(UserRole.MANAGER); setSelectedUserId('');}} label="مدير" />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {selectedRole !== UserRole.MANAGER && (
            <div className="relative group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <UserCircle size={20} />
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white appearance-none transition-all shadow-inner"
              >
                <option value="">اختر اسمك من القائمة...</option>
                {filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <KeyRound size={20} />
            </div>
            <input
              type="password"
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-12 font-black outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-center tracking-[0.5em] text-xl shadow-inner transition-all"
              placeholder="أدخل الرمز"
            />
          </div>

          {error && <p className="text-rose-500 text-[10px] font-black text-center animate-bounce">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.97] transition-all mt-4 text-base relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              دخول للنظام <ShieldCheck size={20} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>
        
        <p className="text-center text-[9px] font-bold text-slate-300 mt-10 uppercase tracking-widest">جميع الحقوق محفوظة © 2025</p>
      </div>
    </div>
  );
};

const RoleButton = ({ icon, role, current, onClick, label }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 py-3 text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
      current === role ? 'bg-white text-indigo-600 shadow-lg scale-105 border border-slate-50' : 'text-slate-400'
    }`}
  >
    {icon} {label}
  </button>
);

export default Login;
