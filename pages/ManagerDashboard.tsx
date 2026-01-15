
import React, { useState, useMemo } from 'react';
import { Order, User, UserRole, OrderStatus, Company, ActivityLog } from '../types';
// Fixed: Added MoreHorizontal and Sparkles to lucide-react imports
import { Search, Edit3, Phone, ArrowUpDown, Calendar, ChevronDown, ChevronUp, MapPin, List, Clock, User as UserIcon, Star, Building2, CheckCircle, ClipboardList, Archive, Trash2, PlusCircle, Shield, Key, Navigation, Activity, MessageSquare, Send, Bell, ExternalLink, Info, BarChart3, X, UserCheck, Briefcase, Zap, MoreHorizontal, Sparkles } from 'lucide-react';

const toEngDigits = (str: string) => str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

interface ManagerDashboardProps {
  orders: Order[];
  users: User[];
  onUpdateUser: (updatedUsers: User[]) => void;
  onEditOrder: (order: Order) => void;
  onUpdateOrders: (updatedOrders: Order[]) => void;
  onSetPreferredDriver: (orderId: string, driverId: string, driverName: string) => void;
  onSendAlert: (userId: string, message: string) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ orders, users, onUpdateUser, onEditOrder, onUpdateOrders, onSetPreferredDriver, onSendAlert, activeTab, setActiveTab }) => {
  const [search, setSearch] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'area' | 'status' | 'company'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', code: '', role: UserRole.DELEGATE, assignedCompanies: [Company.MAHFAZA] });
  const [chatTarget, setChatTarget] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  const { activeList, archivedList } = useMemo(() => {
    const cleanSearch = toEngDigits(search);
    let filtered = orders.filter(o => !o.isSeparator && (o.customerName.includes(cleanSearch) || o.phoneNumber.includes(cleanSearch) || o.area.includes(cleanSearch)));
    filtered.sort((a, b) => {
      let valA: any = a[sortBy] || '';
      let valB: any = b[sortBy] || '';
      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
    filtered.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
    const active = filtered.filter(o => o.status !== OrderStatus.RECEIVED && o.status !== OrderStatus.REJECTED);
    const archived = filtered.filter(o => o.status === OrderStatus.RECEIVED || o.status === OrderStatus.REJECTED);
    return { activeList: active, archivedList: archived };
  }, [orders, search, sortBy, sortDir]);

  const analyticsData = useMemo(() => {
    let list = orders.filter(o => !o.isSeparator);
    if (selectedUserIds.length > 0) {
      list = list.filter(o => selectedUserIds.includes(o.delegateId) || (o.driverId && selectedUserIds.includes(o.driverId)));
    }
    const received = list.filter(o => o.status === OrderStatus.RECEIVED).length;
    return { received, km: received * 4.5, active: list.filter(o => o.status !== 'RECEIVED' && o.status !== 'REJECTED').length };
  }, [orders, selectedUserIds]);

  const translateStatus = (s: string) => {
    const map: any = { PENDING: 'انتظار', RECEIVED: 'مستلم', REJECTED: 'مرفوض', BUSY: 'مشغول', NO_ANSWER: 'لا يرد', BLOCKED: 'محظور', POSTPONED: 'تأجيل', WRONG_NUMBER: 'رقم خطأ' };
    return map[s] || s;
  };

  const OrderCard = ({ o }: { o: Order }) => (
    <div key={o.id} className={`p-5 rounded-[2.5rem] border shadow-sm transition-all bg-white relative hover:shadow-lg hover:border-indigo-100 ${o.isUrgent ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start">
         <div onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} className="cursor-pointer flex-grow">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className={`font-black text-sm ${o.isUrgent ? 'text-rose-600' : 'text-slate-800'}`}>{o.customerName}</h4>
              <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full text-white ${o.company === Company.MAHFAZA ? 'bg-indigo-600' : 'bg-emerald-500'}`}>{o.company === Company.MAHFAZA ? 'محفظة' : 'بداعة'}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
               <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-400"/> {o.area}</span>
               <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[8px] font-black">{translateStatus(o.status)}</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <button onClick={() => {
              const isNowUrgent = !o.isUrgent;
              const note = isNowUrgent ? (prompt("ملاحظة الطلب العاجل:") || "عاجل") : "";
              const now = new Date();
              const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
              onUpdateOrders(orders.map(item => item.id === o.id ? { ...item, isUrgent: isNowUrgent, urgentNote: note, updatedAt: ts, logs: [...item.logs, { timestamp: ts, action: 'URGENT_MARK' as any, user: 'المدير', note }] } : item));
            }} className={`w-10 h-10 rounded-2xl border transition-all flex items-center justify-center ${o.isUrgent ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-300 border-slate-100 hover:text-rose-400'}`}><Zap size={18} fill={o.isUrgent ? "currentColor" : "none"}/></button>
            <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"><MoreHorizontal size={20}/></button>
         </div>
      </div>

      {expandedId === o.id && (
        <div className="mt-5 pt-5 border-t border-slate-50 space-y-5 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-50/50 p-5 rounded-[2rem] flex justify-between items-center shadow-inner">
             <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">رقم الاتصال</span>
                <a href={`tel:${o.phoneNumber}`} className="text-base font-black text-indigo-700">{o.phoneNumber}</a>
             </div>
             <button onClick={() => {
                const newName = prompt("تعديل الاسم:", o.customerName) || o.customerName;
                const newPhone = prompt("تعديل الهاتف:", o.phoneNumber) || o.phoneNumber;
                const newCarpet = Number(prompt("عدد السجاد:", o.carpetCount.toString())) || o.carpetCount;
                const now = new Date();
                const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
                onUpdateOrders(orders.map(item => item.id === o.id ? { ...item, customerName: newName, phoneNumber: newPhone, carpetCount: newCarpet, updatedAt: ts, logs: [...item.logs, { timestamp: ts, action: 'EDITED' as any, user: 'المدير' }] } : item));
             }} className="w-10 h-10 bg-white text-indigo-600 rounded-xl shadow-sm flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={18}/></button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><span className="text-slate-400 block mb-1">الإنشاء</span>{o.createdAt}</div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><span className="text-slate-400 block mb-1">تحديث</span>{o.updatedAt}</div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><span className="text-slate-400 block mb-1">المندوب</span>{o.delegateName}</div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><span className="text-slate-400 block mb-1">السائق</span>{o.driverName || 'بانتظار التعيين'}</div>
          </div>

          <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ النشاط</span>
             </div>
             <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                {o.logs.slice().reverse().map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] bg-white p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-black text-slate-800">{translateStatus(log.action as string)}</span>
                      <span className="text-[8px] text-slate-400 block mt-1">بواسطة: {log.user}</span>
                      {log.note && <p className="text-rose-500 italic mt-1 font-bold">{log.note}</p>}
                    </div>
                    <div className="text-left font-mono opacity-40">{log.timestamp}</div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-3">
             {o.locationUrl && <a href={o.locationUrl} target="_blank" className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"><Navigation size={18}/> الموقع</a>}
             <button onClick={() => {
                const sid = prompt("اسم السائق (ارشد، حمزة، ياسر، محمد برهان، بشار):");
                if(sid) {
                  const drv = users.find(u => u.name === sid);
                  if(drv) onSetPreferredDriver(o.id, drv.id, drv.name);
                }
             }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"><UserCheck size={18}/> تعيين كابتن</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {activeTab === 'orders' && (
        <div className="space-y-5">
          <div className="flex gap-3">
            <div className="relative flex-grow group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input placeholder="ابحث في جميع الطلبات..." className="w-full bg-white p-4 pr-12 rounded-[1.8rem] text-[11px] font-bold shadow-sm outline-none border border-slate-100 focus:border-indigo-400 focus:bg-white transition-all" value={search} onChange={e => setSearch(toEngDigits(e.target.value))} />
            </div>
            <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} className="bg-white w-14 h-14 flex items-center justify-center rounded-[1.5rem] shadow-sm border border-slate-100 text-indigo-600 active:scale-90 transition-all"><ArrowUpDown size={22}/></button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
             {[
               { id: 'createdAt', label: 'التاريخ' },
               { id: 'updatedAt', label: 'التحديث' },
               { id: 'area', label: 'المنطقة' },
               { id: 'status', label: 'الحالة' },
               { id: 'company', label: 'الشركة' }
             ].map(s => (
               <button key={s.id} onClick={() => setSortBy(s.id as any)} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black transition-all ${sortBy === s.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>{s.label}</button>
             ))}
          </div>

          <div className="space-y-4">
            {activeList.map(o => <OrderCard key={o.id} o={o} />)}
            {activeList.length === 0 && <div className="text-center py-20 opacity-30 flex flex-col items-center gap-3">
               <ClipboardList size={64} strokeWidth={1} />
               <p className="text-xs font-black uppercase tracking-widest">لا توجد طلبات جارية</p>
            </div>}
          </div>

          <div className="mt-8">
            <button onClick={() => setShowArchive(!showArchive)} className="w-full bg-slate-200/50 hover:bg-slate-200 p-5 rounded-[2.5rem] flex items-center justify-between font-black text-slate-500 text-[11px] active:scale-[0.98] transition-all uppercase tracking-widest">
              <span className="flex items-center gap-3"><Archive size={18}/> الأرشيف ({archivedList.length})</span>
              <ChevronDown size={18} className={`transition-transform duration-500 ${showArchive ? 'rotate-180' : ''}`}/>
            </button>
            {showArchive && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-6 duration-500">
                {archivedList.map(o => <OrderCard key={o.id} o={o} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6 animate-in slide-in-from-left-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50/50 blur-3xl -mr-16 -mt-16" />
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
              <BarChart3 className="text-indigo-600"/> تقارير الأداء الذكية
            </h2>
            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">تحديد الموظفين</span>
                <select multiple className="w-full bg-slate-50/50 p-4 rounded-[2rem] text-[11px] font-black outline-none border border-slate-100 h-40 shadow-inner focus:bg-white transition-all" value={selectedUserIds} onChange={e => setSelectedUserIds(Array.from(e.target.selectedOptions, opt => opt.value))}>
                   {users.filter(u => u.role !== UserRole.MANAGER).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role === 'DRIVER' ? 'سائق' : 'مندوب'})</option>)}
                </select>
                <p className="text-[8px] text-indigo-400 mt-2 mr-3 font-bold">• استخدم Ctrl/Cmd للاختيار المتعدد</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">من تاريخ</span>
                   <input type="date" className="w-full bg-slate-50/50 p-4 rounded-2xl text-[11px] font-black border border-slate-100 shadow-inner" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">إلى تاريخ</span>
                   <input type="date" className="w-full bg-slate-50/50 p-4 rounded-2xl text-[11px] font-black border border-slate-100 shadow-inner" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between aspect-square">
                <CheckCircle size={32} className="opacity-20" />
                <div>
                   <p className="text-[11px] font-black opacity-80 uppercase tracking-widest mb-1">الطلبات المنجزة</p>
                   <h3 className="text-5xl font-black">{analyticsData.received}</h3>
                </div>
             </div>
             <div className="bg-emerald-500 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-100 flex flex-col justify-between aspect-square">
                <Navigation size={32} className="opacity-20" />
                <div>
                   <p className="text-[11px] font-black opacity-80 uppercase tracking-widest mb-1">المسافات (تقديري)</p>
                   <h3 className="text-4xl font-black">{analyticsData.km.toFixed(1)} <span className="text-xs">كم</span></h3>
                </div>
             </div>
             <div className="col-span-2 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex items-center justify-between">
                <div>
                   <p className="text-[11px] font-black opacity-60 uppercase tracking-widest mb-1">ساعات العمل الفعلية</p>
                   <h3 className="text-4xl font-black">{Math.floor(analyticsData.received * 0.7)} <span className="text-lg">ساعة</span></h3>
                </div>
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Clock size={40} className="text-indigo-400 animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6 animate-in slide-in-from-right-6">
          <button onClick={() => setIsAddingUser(!isAddingUser)} className="w-full bg-indigo-600 text-white p-6 rounded-[2.2rem] font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all group">
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" /> إضافة موظف جديد
          </button>

          {isAddingUser && (
            <div className="bg-white p-8 rounded-[3rem] border-4 border-indigo-50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-500">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الاسم الكامل</label>
                 <input placeholder="الاسم الثلاثي للموظف" className="w-full bg-slate-50 p-4 rounded-2xl font-black text-sm outline-none border border-slate-100 focus:bg-white transition-all shadow-inner" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كود الدخول</label>
                 <input placeholder="الرمز السري (4 أرقام)" className="w-full bg-slate-50 p-4 rounded-2xl font-black text-sm text-center outline-none border border-slate-100 focus:bg-white transition-all shadow-inner tracking-[0.5em]" value={newUser.code} onChange={e => setNewUser({...newUser, code: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">نوع الوظيفة</label>
                 <select className="w-full bg-slate-50 p-4 rounded-2xl font-black text-sm outline-none border border-slate-100 appearance-none shadow-inner" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                    <option value={UserRole.DELEGATE}>مندوب (إدخال طلبات)</option>
                    <option value={UserRole.DRIVER}>سائق (توصيل واستلام)</option>
                 </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">تنسيب الشركة</label>
                  <div className="flex gap-3">
                    <CompanySelectBtn active={newUser.assignedCompanies?.includes(Company.MAHFAZA) && newUser.assignedCompanies.length === 1} color="indigo" onClick={() => setNewUser({...newUser, assignedCompanies: [Company.MAHFAZA]})} label="محفظة" />
                    <CompanySelectBtn active={newUser.assignedCompanies?.includes(Company.BADA_A) && newUser.assignedCompanies.length === 1} color="emerald" onClick={() => setNewUser({...newUser, assignedCompanies: [Company.BADA_A]})} label="بداعة" />
                    <CompanySelectBtn active={newUser.assignedCompanies?.length === 2} color="slate" onClick={() => setNewUser({...newUser, assignedCompanies: [Company.MAHFAZA, Company.BADA_A]})} label="الكل" />
                  </div>
               </div>
               <button onClick={() => {
                 if (!newUser.name || !newUser.code) return alert("الرجاء ملء جميع الحقول");
                 onUpdateUser([...users, { id: `u-${Date.now()}`, name: newUser.name, code: newUser.code, role: newUser.role as UserRole, assignedCompanies: newUser.assignedCompanies || [Company.MAHFAZA], isOnline: false, lastSeen: '', isActive: true }]);
                 setIsAddingUser(false);
                 setNewUser({ name: '', code: '', role: UserRole.DELEGATE, assignedCompanies: [Company.MAHFAZA] });
               }} className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-base active:scale-[0.98] shadow-xl shadow-emerald-100 transition-all">إتمام عملية الإضافة</button>
            </div>
          )}

          <div className="space-y-4">
            {users.filter(u => u.role !== UserRole.MANAGER).map(u => (
              <div key={u.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm group hover:border-indigo-200 hover:shadow-md transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all shadow-inner"><UserIcon size={28}/></div>
                    <div>
                       <h4 className="font-black text-sm text-slate-800">{u.name}</h4>
                       <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${u.role === 'DRIVER' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>{u.role === 'DRIVER' ? 'كابتن' : 'مندوب'}</span>
                          <span className="text-[10px] font-mono font-black text-slate-400">PIN: {u.code}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => { const code = prompt("كود الدخول الجديد:", u.code); if(code) onUpdateUser(users.map(us => us.id === u.id ? {...us, code} : us)); }} className="w-11 h-11 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Key size={20}/></button>
                    <button onClick={() => { if(confirm(`هل أنت متأكد من حذف ${u.name}؟`)) onUpdateUser(users.filter(us => us.id !== u.id)); }} className="w-11 h-11 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
             <div className="absolute left-0 top-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white rounded-full" />
                <div className="absolute bottom-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
             </div>
             <div className="w-20 h-20 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-inner ring-4 ring-indigo-500/10"><MessageSquare size={36} /></div>
             <h2 className="text-2xl font-black text-white mb-2">منصة البث الإداري</h2>
             <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">أرسل تنبيهاً فورياً يظهر للموظف في أعلى الشاشة ويجبره على القراءة</p>
          </div>

          <div className="space-y-3">
             <span className="text-[10px] font-black text-slate-400 mr-3 uppercase tracking-widest px-1">اختيار الهدف</span>
             <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
                {users.filter(u => u.role !== UserRole.MANAGER).map(u => (
                  <button key={u.id} onClick={() => setChatTarget(u.id)} className={`px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all shadow-sm ${chatTarget === u.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>{u.name}</button>
                ))}
             </div>
          </div>

          {chatTarget && (
            <div className="bg-white p-8 rounded-[3rem] border-4 border-indigo-50 shadow-2xl space-y-6 animate-in slide-in-from-bottom-10 duration-500">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner"><UserIcon size={24}/></div>
                  <div>
                    <span className="text-sm font-black text-slate-800">إلى الموظف: {users.find(u => u.id === chatTarget)?.name}</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">التنبيه سيظهر بشكل عائم ومستمر</p>
                  </div>
               </div>
               <textarea placeholder="اكتب نص التنبيه الإداري هنا... كن واضحاً ومختصراً" className="w-full bg-slate-50 p-6 rounded-[2rem] font-black text-sm h-48 outline-none resize-none border border-transparent focus:border-indigo-100 focus:bg-white transition-all shadow-inner" value={alertMessage} onChange={e => setAlertMessage(e.target.value)} />
               <button onClick={() => {
                 if (!alertMessage) return alert("الرجاء كتابة نص التنبيه");
                 onSendAlert(chatTarget, alertMessage);
                 alert("تم إرسال التنبيه فوراً!");
                 setAlertMessage('');
               }} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                  <Send size={22}/> إطلاق البث التنبيهي
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompanySelectBtn = ({ active, color, onClick, label }: any) => {
  const styles: any = {
    indigo: active ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-400',
    emerald: active ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-50 text-slate-400',
    slate: active ? 'bg-slate-800 text-white shadow-slate-200' : 'bg-slate-50 text-slate-400',
  };
  return (
    <button onClick={onClick} className={`flex-1 py-4 rounded-2xl text-[10px] font-black border border-transparent transition-all shadow-sm ${styles[color]} ${active ? 'scale-110 shadow-lg' : ''}`}>{label}</button>
  );
};

export default ManagerDashboard;
