
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Company, User } from '../types';
import { Search, Edit3, MapPin, Clock, Phone, ChevronDown, ChevronUp, ClipboardList, Info, ArrowUpDown, Filter, Layers, Sofa, Home, Car, Shirt } from 'lucide-react';

const toEngDigits = (str: string) => str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

interface DelegateDashboardProps {
  orders: Order[];
  onEditOrder: (order: Order) => void;
  user: User;
}

const DelegateDashboard: React.FC<DelegateDashboardProps> = ({ orders, onEditOrder, user }) => {
  const [search, setSearch] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const { active, archived, remainingCount } = useMemo(() => {
    const cleanSearch = toEngDigits(search);
    let filtered = orders.filter(o => 
      !o.isSeparator && (o.customerName.includes(cleanSearch) || o.phoneNumber.includes(cleanSearch) || o.area.includes(cleanSearch))
    );

    let activeList = filtered.filter(o => o.status !== OrderStatus.RECEIVED && o.status !== OrderStatus.REJECTED);
    let archivedList = filtered.filter(o => o.status === OrderStatus.RECEIVED || o.status === OrderStatus.REJECTED);

    if (sortBy === 'date') {
      activeList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      activeList.sort((a, b) => a.status.localeCompare(b.status));
    }

    return { active: activeList, archived: archivedList, remainingCount: activeList.length };
  }, [orders, search, sortBy]);

  const translateStatus = (s: string) => {
    const map: any = { PENDING: 'انتظار', RECEIVED: 'تم الاستلام', REJECTED: 'مرفوض', BUSY: 'مشغول', NO_ANSWER: 'لا يرد', BLOCKED: 'محظور', POSTPONED: 'تأجيل', WRONG_NUMBER: 'رقم خطأ' };
    return map[s] || s;
  };

  const getServiceIcon = (type: string) => {
    switch(type) {
      case 'SOFA': return <Sofa size={14}/>;
      case 'HOUSE': return <Home size={14}/>;
      case 'CAR': return <Car size={14}/>;
      case 'LAUNDRY': return <Shirt size={14}/>;
      default: return <Layers size={14}/>;
    }
  };

  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'PENDING': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'BUSY': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'NO_ANSWER': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'POSTPONED': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[1.8rem] shadow-lg border border-white flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إحصائياتك الحالية</p>
          <h2 className="text-sm font-black text-slate-800">لديك <span className="text-indigo-600">{remainingCount}</span> مهام نشطة</h2>
        </div>
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg relative z-10">
          <Layers size={18} />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-grow group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={14} />
          <input placeholder="ابحث..." className="w-full bg-white p-3 pr-10 rounded-xl text-[10px] font-bold shadow-sm outline-none border border-slate-100" value={search} onChange={e => setSearch(toEngDigits(e.target.value))} />
        </div>
        <button onClick={() => setSortBy(sortBy === 'date' ? 'status' : 'date')} className="bg-white px-4 rounded-xl shadow-sm border border-slate-100 text-indigo-600 flex items-center gap-2 active:scale-95 transition-all">
          <ArrowUpDown size={14}/>
          <span className="text-[9px] font-black">{sortBy === 'date' ? 'التاريخ' : 'الحالة'}</span>
        </button>
      </div>

      <div className="space-y-2">
        {active.map((o, index) => (
          <div key={o.id} className="bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm relative flex justify-between items-center group transition-all hover:border-indigo-100 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 30}ms` }}>
            <div className={`absolute right-0 top-3 bottom-3 w-1 rounded-l-full ${o.company === Company.MAHFAZA ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
            <div className="flex-grow pr-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-indigo-400">{getServiceIcon(o.serviceType)}</div>
                <h4 className="font-black text-slate-800 text-[11px] leading-none">{o.customerName}</h4>
                <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-full text-white ${o.company === Company.MAHFAZA ? 'bg-indigo-600' : 'bg-emerald-500'}`}>{o.company === Company.MAHFAZA ? 'محفظة' : 'بداعة'}</span>
              </div>
              <div className="flex items-center flex-wrap gap-2 text-[8px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={10} className="text-indigo-400"/> {o.area}</span>
                <span className="flex items-center gap-1"><Clock size={10} className="text-slate-300"/> {o.createdAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[7px] font-black border ${getStatusStyle(o.status)}`}>{translateStatus(o.status)}</span>
              <button onClick={() => onEditOrder(o)} className="w-8 h-8 flex items-center justify-center text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"><Edit3 size={14}/></button>
              <a href={`tel:${o.phoneNumber}`} className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"><Phone size={14}/></a>
            </div>
          </div>
        ))}
        {active.length === 0 && <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
            <ClipboardList size={48} strokeWidth={1} />
            <p className="text-[10px] font-black">لا توجد طلبات جارية</p>
        </div>}
      </div>

      <div className="mt-4">
        <button onClick={() => setShowArchive(!showArchive)} className="w-full bg-slate-100 hover:bg-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-slate-500 text-[9px] transition-all">
          <Info size={12}/> {showArchive ? 'إخفاء الأرشيف' : `عرض الأرشيف (${archived.length})`} {showArchive ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>
        {showArchive && (
          <div className="mt-2 space-y-1.5 animate-in slide-in-from-top-4 duration-500">
            {archived.map(o => (
              <div key={o.id} className="p-3 rounded-xl border flex justify-between items-center bg-white border-slate-50 hover:border-indigo-200 transition-all">
                <div className="flex-grow">
                   <p className="text-[10px] font-black text-slate-700">{o.customerName}</p>
                   <span className="text-[8px] font-bold text-slate-400">{o.area} • {o.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`font-black px-2 py-0.5 rounded-lg text-[7px] ${o.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{translateStatus(o.status)}</span>
                   {/* Enabled editing for archived orders */}
                   <button onClick={() => onEditOrder(o)} className="w-7 h-7 flex items-center justify-center text-indigo-400 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-all"><Edit3 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegateDashboard;
