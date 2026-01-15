
import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, UserRole, OrderStatus, Company, ServiceCategory } from './types';
import { INITIAL_USERS, MOCK_ORDERS } from './mockData';
import Login from './pages/Login';
import DelegateDashboard from './pages/DelegateDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { 
  LogOut, ClipboardList, TrendingUp, Users, PlusCircle, 
  Activity, BarChart3, MapPin, Trash2, CheckSquare, 
  Square, Building2, Map as MapIcon, Calendar, 
  TrendingDown, ChevronLeft, ChevronRight, Filter, 
  Cloud, CloudOff, RefreshCw, Info, Navigation, 
  UserCheck, Briefcase, MessageSquare, Bell, X, 
  Clock, CheckCircle2, AlertCircle, Sparkles, LayoutDashboard,
  Home, Car, Shirt, Sofa, Layers, Edit3, DollarSign, Search
} from 'lucide-react';

const toEngDigits = (str: string) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
};

const DelegateAdd: React.FC<{ onAddOrder: (data: Partial<Order>) => void, user: User, editingOrder?: Order | null, onCancelEdit?: () => void }> = ({ onAddOrder, user, editingOrder, onCancelEdit }) => {
  const defaultCompany = user.assignedCompanies.includes(Company.MAHFAZA) 
    ? Company.MAHFAZA 
    : (user.assignedCompanies[0] || Company.MAHFAZA);

  const [formData, setFormData] = useState({
    customerName: '', phoneNumber: '', area: '', landmark: '', howHeard: 'فيسبوك', referredBy: '', carpetCount: '', notes: '', company: defaultCompany, serviceType: 'CARPET' as ServiceCategory
  });

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        customerName: editingOrder.customerName,
        phoneNumber: editingOrder.phoneNumber,
        area: editingOrder.area,
        landmark: editingOrder.landmark || '',
        howHeard: editingOrder.howHeard,
        referredBy: editingOrder.referredBy || '',
        carpetCount: editingOrder.carpetCount.toString(),
        notes: editingOrder.notes || '',
        company: editingOrder.company,
        serviceType: editingOrder.serviceType
      });
    }
  }, [editingOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = toEngDigits(formData.phoneNumber);
    const cleanCarpet = toEngDigits(formData.carpetCount);
    if (isNaN(Number(cleanPhone)) || isNaN(Number(cleanCarpet)) || cleanCarpet === '') {
      alert('الرجاء التأكد من إدخال أرقام صحيحة');
      return;
    }
    onAddOrder({...formData, id: editingOrder?.id, phoneNumber: cleanPhone, carpetCount: Number(cleanCarpet)});
    if (!editingOrder) {
      setFormData({ ...formData, customerName: '', phoneNumber: '', area: '', landmark: '', carpetCount: '', notes: '', referredBy: '', howHeard: 'فيسبوك', company: defaultCompany });
      alert('تم إضافة الطلب بنجاح');
    } else {
      alert('تم تحديث الطلب');
      if (onCancelEdit) onCancelEdit();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            {editingOrder ? <Edit3 size={20} /> : <PlusCircle size={20} />}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800">{editingOrder ? 'تعديل طلب السجاد' : 'طلب جديد (سجاد)'}</h2>
          </div>
        </div>
        {editingOrder && (
           <button onClick={onCancelEdit} className="text-xs font-black text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full">إلغاء التعديل</button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            {user.assignedCompanies.includes(Company.MAHFAZA) && (
              <button type="button" onClick={() => setFormData({...formData, company: Company.MAHFAZA})} className={`py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.company === Company.MAHFAZA ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                <Building2 size={16} />
                <span className="text-[11px] font-black">محفظة</span>
              </button>
            )}
            {user.assignedCompanies.includes(Company.BADA_A) && (
              <button type="button" onClick={() => setFormData({...formData, company: Company.BADA_A})} className={`py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.company === Company.BADA_A ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                <Sparkles size={16} />
                <span className="text-[11px] font-black">بداعة</span>
              </button>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3">
           <input required placeholder="اسم الزبون" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100 focus:bg-white focus:border-indigo-300" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
           <input required placeholder="رقم الهاتف" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs text-left outline-none border border-slate-100 focus:bg-white focus:border-indigo-300" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: toEngDigits(e.target.value).replace(/\D/g, '')})} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="المنطقة" className="bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100 focus:bg-white focus:border-indigo-300" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
          <input placeholder="نقطة دالة" className="bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100 focus:bg-white focus:border-indigo-300" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="flex items-center gap-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
             <label className="text-[11px] font-black text-indigo-600 whitespace-nowrap">العدد:</label>
             <input required type="text" placeholder="0" className="w-full bg-white p-2 rounded-xl font-black text-center text-sm outline-none border border-indigo-100" value={formData.carpetCount} onChange={e => setFormData({...formData, carpetCount: toEngDigits(e.target.value).replace(/\D/g, '')})} />
           </div>
           <select className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100" value={formData.howHeard} onChange={e => setFormData({...formData, howHeard: e.target.value})}>
             <option value="فيسبوك">فيسبوك</option>
             <option value="تيك توك">تيك توك</option>
             <option value="انستغرام">انستغرام</option>
             <option value="توصية">توصية من صديق</option>
             <option value="أخرى">أخرى</option>
           </select>
        </div>

        <textarea placeholder="ملاحظات المندوب..." className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100 h-20 resize-none focus:bg-white" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm">
            {editingOrder ? 'حفظ التعديلات' : 'تأكيد وإرسال الطلب'}
        </button>
      </form>
    </div>
  );
};

const ServicesAdd: React.FC<{ onAddOrder: (data: Partial<Order>) => void, user: User }> = ({ onAddOrder, user }) => {
  const defaultCompany = user.assignedCompanies.includes(Company.MAHFAZA) ? Company.MAHFAZA : Company.BADA_A;
  const [formData, setFormData] = useState({
    customerName: '', phoneNumber: '', area: '', landmark: '', company: defaultCompany, serviceType: 'SOFA' as ServiceCategory, price: '', notes: ''
  });

  const services = [
    { id: 'SOFA', label: 'قنفات', icon: <Sofa size={18}/> },
    { id: 'HOUSE', label: 'منازل', icon: <Home size={18}/> },
    { id: 'CAR', label: 'سيارات', icon: <Car size={18}/> },
    { id: 'LAUNDRY', label: 'مكوى', icon: <Shirt size={18}/> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = toEngDigits(formData.phoneNumber);
    onAddOrder({...formData, phoneNumber: cleanPhone, carpetCount: 0});
    setFormData({ ...formData, customerName: '', phoneNumber: '', area: '', landmark: '', notes: '', price: '' });
    alert('تم حجز الخدمة بنجاح');
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
          <Layers size={20} />
        </div>
        <h2 className="text-base font-black text-slate-800">حجز خدمة إضافية</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
          <button type="button" onClick={() => setFormData({...formData, company: Company.MAHFAZA})} className={`py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.company === Company.MAHFAZA ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
            <Building2 size={16} />
            <span className="text-[11px] font-black">محفظة</span>
          </button>
          <button type="button" onClick={() => setFormData({...formData, company: Company.BADA_A})} className={`py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.company === Company.BADA_A ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
            <Sparkles size={16} />
            <span className="text-[11px] font-black">بداعة</span>
          </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {services.map(s => (
          <button key={s.id} onClick={() => setFormData({...formData, serviceType: s.id as ServiceCategory})} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${formData.serviceType === s.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {s.icon}
            <span className="text-[9px] font-black">{s.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="اسم الزبون" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs outline-none border border-slate-100" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
          <input required placeholder="الهاتف" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs text-left border border-slate-100" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: toEngDigits(e.target.value).replace(/\D/g, '')})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="المنطقة" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs border border-slate-100" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
          <input placeholder="نقطة دالة" className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs border border-slate-100" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} />
        </div>
        
        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <DollarSign size={16} className="text-emerald-600" />
          <input placeholder="السعر المتفق عليه" className="w-full bg-transparent font-black text-xs outline-none" value={formData.price} onChange={e => setFormData({...formData, price: toEngDigits(e.target.value).replace(/\D/g, '')})} />
        </div>

        <textarea placeholder="ملاحظات وتفاصيل إضافية..." className="w-full bg-slate-50 p-3.5 rounded-2xl font-bold text-xs border border-slate-100 h-20 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        
        <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100">إتمام الحجز</button>
      </form>
    </div>
  );
};

const ProgressReport: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      if (!o.createdAt || o.isSeparator) return false;
      const parts = o.createdAt.split(' ')[1].split('/');
      const orderDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      
      if (period === 'today') {
        const todayStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
        return o.createdAt.includes(todayStr);
      }
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        return orderDate >= monthAgo;
      }
      if (period === 'custom') {
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;
        if (from && orderDate < from) return false;
        if (to && orderDate > to) return false;
        return true;
      }
      return true;
    });
  }, [orders, period, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const received = filteredOrders.filter(o => o.status === OrderStatus.RECEIVED).length;
    const rejected = filteredOrders.filter(o => o.status === OrderStatus.REJECTED).length;
    const added = filteredOrders.length;
    const km = received * 4.2; 
    const hours = (received * 0.75) + (rejected * 0.2); 
    return { received, rejected, added, km, hours };
  }, [filteredOrders]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Activity size={24} className="text-indigo-600"/> نبض النشاط
          </h2>
        </div>
        
        <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6">
          {(['today', 'week', 'month', 'custom'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${period === p ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : p === 'month' ? 'الشهر' : 'مخصص'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-6 animate-in slide-in-from-top-2">
            <input type="date" className="w-full bg-slate-50 p-3.5 rounded-2xl text-[11px] font-bold outline-none border border-slate-100 focus:border-indigo-300" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" className="w-full bg-slate-50 p-3.5 rounded-2xl text-[11px] font-bold outline-none border border-slate-100 focus:border-indigo-300" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
           {/* New Stat: Added Orders */}
           <div className="col-span-2 bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-slate-400 flex items-center justify-between overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <p className="text-[11px] font-black opacity-60 uppercase tracking-widest mb-1">الطلبات المضافة</p>
                <h3 className="text-4xl font-black">{stats.added} <span className="text-sm font-bold opacity-40">طلب</span></h3>
              </div>
              <PlusCircle size={40} className="opacity-20 relative z-10" />
           </div>

           <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-lg shadow-emerald-100 flex flex-col justify-between aspect-square">
              <CheckCircle2 size={24} className="opacity-30" />
              <div>
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">المستلم</p>
                <h3 className="text-4xl font-black">{stats.received}</h3>
              </div>
           </div>
           
           <div className="bg-rose-500 p-6 rounded-[2.5rem] text-white shadow-lg shadow-rose-100 flex flex-col justify-between aspect-square">
              <AlertCircle size={24} className="opacity-30" />
              <div>
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">المرفوض</p>
                <h3 className="text-4xl font-black">{stats.rejected}</h3>
              </div>
           </div>

           <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-indigo-100 flex flex-col justify-between aspect-square">
              <Navigation size={24} className="opacity-30" />
              <div>
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">المسافة</p>
                <h3 className="text-3xl font-black leading-none">{stats.km.toFixed(1)} <span className="text-xs">كم</span></h3>
              </div>
           </div>

           <div className="bg-slate-800 p-6 rounded-[2.5rem] text-white shadow-lg shadow-slate-300 flex flex-col justify-between aspect-square">
              <Clock size={24} className="opacity-30" />
              <div>
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">الساعات</p>
                <h3 className="text-3xl font-black leading-none">{stats.hours.toFixed(1)} <span className="text-xs">ساعة</span></h3>
              </div>
           </div>
        </div>

        {filteredOrders.length === 0 && <div className="text-center py-16 opacity-30 flex flex-col items-center gap-3">
            <ClipboardList size={48} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-widest">لا توجد سجلات حالياً</p>
        </div>}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('curr_mahf_v17');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users_mahf_v17');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders_mahf_v17');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });
  
  const [activeTab, setActiveTab] = useState<'add' | 'orders' | 'progress' | 'team' | 'activity' | 'chat' | 'services'>('orders');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem('users_mahf_v17', JSON.stringify(users));
    localStorage.setItem('orders_mahf_v17', JSON.stringify(orders));
    if (currentUser) {
      const refreshedUser = users.find(u => u.id === currentUser.id);
      if (!refreshedUser) {
        setCurrentUser(null);
        localStorage.removeItem('curr_mahf_v17');
      } else {
        localStorage.setItem('curr_mahf_v17', JSON.stringify(refreshedUser));
      }
    }
  }, [orders, users, currentUser]);

  const addOrUpdateOrder = (data: Partial<Order>) => {
    if (!currentUser) return;
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    if (data.id) {
      setOrders(prev => prev.map(o => o.id === data.id ? { 
        ...o, 
        ...data, 
        updatedAt: ts, 
        logs: [...o.logs, { timestamp: ts, action: 'EDITED' as any, user: currentUser.name }] 
      } : o));
    } else {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`, customerName: data.customerName || '', phoneNumber: data.phoneNumber || '', area: data.area || '', landmark: data.landmark || '', howHeard: data.howHeard || 'فيسبوك', referredBy: data.referredBy || '', carpetCount: data.carpetCount || 0, price: data.price || '', notes: data.notes || '', createdAt: ts, delegateId: currentUser.id, delegateName: currentUser.name, company: data.company || Company.MAHFAZA, status: OrderStatus.PENDING, serviceType: data.serviceType || 'CARPET', busyCount: 0, noAnswerCount: 0, blockedCount: 0, postponedCount: 0, wrongNumberCount: 0, updatedAt: ts, logs: [{ timestamp: ts, action: 'CREATED' as any, user: currentUser.name }],
      };
      setOrders([newOrder, ...orders]);
    }
  };

  const updateOrderStatus = (id: string, status: OrderStatus, data?: any) => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data, status, updatedAt: ts, logs: [...o.logs, { timestamp: ts, action: status, user: currentUser?.name || 'System' }] } : o));
  };

  const sendAlert = (userId: string, message: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, systemAlert: message } : u));
  };

  const clearAlert = () => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, systemAlert: undefined } : u));
      setCurrentUser({ ...currentUser, systemAlert: undefined });
    }
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} users={users} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-cairo text-right overflow-x-hidden" dir="rtl">
      {currentUser.systemAlert && (
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-2xl animate-in slide-in-from-top-full duration-500">
           <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Bell size={18} />
             </div>
             <span className="text-xs font-black leading-tight">{currentUser.systemAlert}</span>
           </div>
           <button onClick={clearAlert} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={18}/></button>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-lg px-6 py-4 flex justify-between items-center sticky top-0 z-[90] border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">MB</div>
          <div>
            <h1 className="font-black text-slate-800 text-[11px] uppercase leading-none tracking-tighter">محفظة وبداعة</h1>
            <p className="text-[7px] font-black text-indigo-500 tracking-[0.2em] mt-1">SMART MANAGEMENT V2</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
           <div className="text-left">
             <span className="text-[10px] font-black text-slate-900 block leading-none">{currentUser.name}</span>
             <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role === 'MANAGER' ? 'المدير العام' : currentUser.role === 'DRIVER' ? 'كابتن التوصيل' : 'مندوب المبيعات'}</span>
           </div>
           <button onClick={() => setCurrentUser(null)} className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300">
             <LogOut size={20} />
           </button>
        </div>
      </header>

      <main className="flex-grow px-4 pt-4 max-w-xl mx-auto w-full pb-32">
        {currentUser.role === UserRole.DELEGATE && (
          activeTab === 'add' ? <DelegateAdd onAddOrder={addOrUpdateOrder} user={currentUser} editingOrder={editingOrder} onCancelEdit={() => {setEditingOrder(null); setActiveTab('orders');}} /> :
          activeTab === 'orders' ? <DelegateDashboard orders={orders.filter(o => o.delegateId === currentUser.id)} onEditOrder={(o) => {setEditingOrder(o); setActiveTab('add');}} user={currentUser} /> :
          activeTab === 'services' ? <ServicesAdd onAddOrder={addOrUpdateOrder} user={currentUser} /> :
          <ProgressReport orders={orders.filter(o => o.delegateId === currentUser.id)} />
        )}
        {currentUser.role === UserRole.DRIVER && (
          activeTab === 'orders' ? <DriverDashboard orders={orders} onUpdateStatus={updateOrderStatus} onEditOrder={() => {}} onReorder={setOrders} currentDriver={currentUser} /> :
          <ProgressReport orders={orders.filter(o => o.driverId === currentUser.id)} />
        )}
        {currentUser.role === UserRole.MANAGER && (
          <ManagerDashboard 
            orders={orders} 
            users={users} 
            onUpdateUser={setUsers} 
            onEditOrder={() => {}} 
            onUpdateOrders={setOrders}
            onSetPreferredDriver={(oid, did, dname) => updateOrderStatus(oid, OrderStatus.PENDING, { driverId: did, driverName: dname })}
            onSendAlert={sendAlert}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      <nav className="fixed bottom-4 inset-x-4 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/50 flex items-center justify-around z-[95] shadow-2xl shadow-indigo-200/50 h-16 rounded-[2rem] px-2">
        {currentUser.role === UserRole.MANAGER ? (
          <>
            <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<LayoutDashboard size={20} />} label="الرئيسية" />
            <NavItem active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<BarChart3 size={20} />} label="التحليل" />
            <NavItem active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users size={20} />} label="الفريق" />
            <NavItem active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={20} />} label="بث" />
          </>
        ) : (
          <>
            {currentUser.role === UserRole.DELEGATE && <NavItem active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<PlusCircle size={20} />} label="سجاد" />}
            {currentUser.role === UserRole.DELEGATE && <NavItem active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={<Layers size={20} />} label="خدمات" />}
            <NavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ClipboardList size={20} />} label="طلباتي" />
            <NavItem active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={<TrendingUp size={20} />} label="إنجازي" />
          </>
        )}
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    {active && <div className="absolute top-0 w-6 h-0.5 bg-indigo-600 rounded-full animate-in fade-in duration-500" />}
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className={`text-[7px] mt-1 font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;
