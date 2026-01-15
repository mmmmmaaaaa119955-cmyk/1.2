
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, User, Company } from '../types';
// Fixed: Added Building2 and Sparkles to lucide-react imports
import { Phone, ChevronDown, ChevronUp, Search, X, CheckCircle, Clock, MapPin, Edit3, PlusCircle, Star, Navigation, Ban, MessageSquare, Loader2, GripVertical, Navigation2, MoreHorizontal, Building2, Sparkles, Sofa, Home, Car, Shirt, Layers } from 'lucide-react';

const toEngDigits = (str: string) => str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

const getDaysDiff = (createdAt: string) => {
  try {
    if (!createdAt) return 0;
    const parts = createdAt.split(' ')[1].split('/');
    const createdDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch(e) { return 0; }
};

interface DriverDashboardProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus, data?: any) => void;
  onEditOrder: (order: Partial<Order>) => void;
  onReorder: (orders: Order[]) => void;
  currentDriver: User;
  isServicesTab?: boolean;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ orders, onUpdateStatus, onEditOrder, onReorder, currentDriver, isServicesTab }) => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'status' | 'area' | 'manual'>('manual');
  const [showArchive, setShowArchive] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [carpets, setCarpets] = useState(0);
  const [driverNote, setDriverNote] = useState('');
  const [capturedLocation, setCapturedLocation] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { activeItems, archivedItems, remainingCount } = useMemo(() => {
    const cleanSearch = toEngDigits(search);
    let list = [...orders].filter(o => {
      const isMyCompany = o.isSeparator || currentDriver.assignedCompanies.includes(o.company);
      const isNotDone = o.isSeparator || (o.status !== OrderStatus.RECEIVED && o.status !== OrderStatus.REJECTED);
      const matchesSearch = o.isSeparator || o.customerName.includes(cleanSearch) || o.phoneNumber.includes(cleanSearch) || o.area.includes(cleanSearch);
      return isMyCompany && isNotDone && matchesSearch;
    });

    if (sortBy === 'time') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sortBy === 'status') list.sort((a, b) => a.status.localeCompare(b.status));
    else if (sortBy === 'area') list.sort((a, b) => a.area.localeCompare(b.area));

    const archived = orders.filter(o => 
      !o.isSeparator && 
      (o.status === OrderStatus.RECEIVED || o.status === OrderStatus.REJECTED) &&
      currentDriver.assignedCompanies.includes(o.company)
    );

    return { activeItems: list, archivedItems: archived, remainingCount: list.filter(o => !o.isSeparator).length };
  }, [orders, search, sortBy, currentDriver]);

  const handleDragStart = (index: number) => sortBy === 'manual' && setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (sortBy !== 'manual' || draggedIndex === null || draggedIndex === index) return;
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (sortBy !== 'manual' || draggedIndex === null || draggedIndex === index) return;
    const newItems = [...orders];
    const draggedItem = activeItems[draggedIndex];
    const targetItem = activeItems[index];
    const actualDraggedIdx = orders.findIndex(o => o.id === draggedItem.id);
    const actualTargetIdx = orders.findIndex(o => o.id === targetItem.id);
    const [moved] = newItems.splice(actualDraggedIdx, 1);
    newItems.splice(actualTargetIdx, 0, moved);
    onReorder(newItems);
    setDraggedIndex(null);
  };

  const fetchManualLocation = () => {
    if (!("geolocation" in navigator)) return alert("تحديد الموقع غير مدعوم");
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapturedLocation(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
        setIsFetchingLocation(false);
      },
      (err) => { alert("فشل: " + err.message); setIsFetchingLocation(false); },
      { timeout: 8000 }
    );
  };

  const handleAction = (status: OrderStatus) => {
    if (!selectedOrder) return;
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const statusData: any = { 
      updatedAt: ts, driverId: currentDriver.id, driverName: currentDriver.name,
      notes: driverNote ? `${selectedOrder.notes || ''} | ملاحظة السائق: ${driverNote}` : selectedOrder.notes
    };
    if (capturedLocation) statusData.locationUrl = capturedLocation;
    if (status === OrderStatus.RECEIVED) {
      statusData.receiptNumber = toEngDigits(receipt);
      statusData.carpetCount = carpets;
    }
    onUpdateStatus(selectedOrder.id, status, statusData);
    setSelectedOrder(null);
    setDriverNote('');
    setCapturedLocation(null);
  };

  const translateStatus = (s: string) => {
    const map: any = { PENDING: 'قيد الانتظار', RECEIVED: 'مستلم', REJECTED: 'مرفوض', BUSY: 'مشغول', NO_ANSWER: 'لا يرد', BLOCKED: 'محظور', POSTPONED: 'مؤجل', WRONG_NUMBER: 'رقم خطأ' };
    return map[s] || s;
  };

  const getStatusColor = (s: OrderStatus) => {
    switch(s) {
      case OrderStatus.PENDING: return 'bg-indigo-600';
      case OrderStatus.RECEIVED: return 'bg-emerald-500';
      case OrderStatus.REJECTED: return 'bg-rose-500';
      case OrderStatus.BUSY: return 'bg-amber-500';
      case OrderStatus.NO_ANSWER: return 'bg-purple-500';
      case OrderStatus.POSTPONED: return 'bg-slate-500';
      default: return 'bg-slate-300';
    }
  };

  const getServiceIcon = (type: string) => {
    switch(type) {
      case 'SOFA': return <Sofa size={14}/>;
      case 'HOUSE': return <Home size={14}/>;
      case 'CAR': return <Car size={14}/>;
      case 'LAUNDRY': return <Shirt size={14}/>;
      default: return <Building2 size={14}/>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-3xl -mr-12 -mt-12" />
        <div className="relative z-10">
          <h2 className="text-[11px] font-black text-slate-800 leading-none">الكابتن: {currentDriver.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
             <span className="bg-amber-100/50 text-amber-700 px-2.5 py-0.5 rounded-full text-[8px] font-black">{remainingCount} {isServicesTab ? 'حجوزات' : 'مهام'} متبقية</span>
          </div>
        </div>
        {!isServicesTab && (
          <button onClick={() => {
              const text = prompt("أدخل عنوان الفاصل (مثلاً: طلبيات العصر):");
              if (!text) return;
              onReorder([{ id: `SEP-${Date.now()}`, customerName: '', phoneNumber: '', area: '', howHeard: '', carpetCount: 0, createdAt: '', updatedAt: '', delegateId: '', delegateName: '', company: Company.MAHFAZA, status: OrderStatus.PENDING, serviceType: 'CARPET', busyCount: 0, noAnswerCount: 0, blockedCount: 0, postponedCount: 0, wrongNumberCount: 0, logs: [], isSeparator: true, separatorText: text }, ...orders]);
          }} className="bg-rose-50 text-rose-600 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all shadow-sm active:scale-90 relative z-10">
            <PlusCircle size={20}/>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
          <input placeholder="ابحث باسم الزبون أو المنطقة..." className="w-full bg-white p-3 pr-10 rounded-xl text-[10px] font-bold shadow-sm border border-slate-100 outline-none focus:border-indigo-400 focus:bg-white transition-all" value={search} onChange={e => setSearch(toEngDigits(e.target.value))} />
        </div>
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
           {(['manual', 'time', 'area'] as const).map(mode => (
             <button key={mode} onClick={() => setSortBy(mode)} className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${sortBy === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
               {mode === 'manual' ? 'يدوي' : mode === 'time' ? 'الأحدث' : 'المنطقة'}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-3">
        {activeItems.map((o, index) => {
          if (o.isSeparator) return (
            <div key={o.id} className="py-2 flex items-center gap-3">
              <div className="flex-grow h-px bg-slate-200"></div>
              <div className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-[9px] font-black border border-rose-100 shadow-sm uppercase tracking-widest">{o.separatorText}</div>
              <div className="flex-grow h-px bg-slate-200"></div>
            </div>
          );
          const days = getDaysDiff(o.createdAt);
          return (
            <div 
              key={o.id}
              draggable={sortBy === 'manual'}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onClick={() => { setSelectedOrder(o); setCarpets(o.carpetCount); setReceipt(o.receiptNumber || ''); }}
              className={`group bg-white p-4 rounded-[1.8rem] border transition-all active:scale-[0.98] relative flex items-center gap-3 shadow-sm hover:shadow-md ${draggedIndex === index ? 'opacity-30' : ''} ${o.isUrgent ? 'border-rose-400 bg-rose-50/20' : 'border-slate-100'}`}>
              
              {sortBy === 'manual' && <GripVertical size={16} className="text-slate-200 flex-shrink-0 cursor-grab active:cursor-grabbing" />}
              
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-l-full ${getStatusColor(o.status)}`}></div>
              
              <div className="flex-grow pr-2">
                <div className="flex items-center gap-2 mb-1">
                   <div className="text-indigo-400">{getServiceIcon(o.serviceType)}</div>
                   <h4 className={`font-black text-xs ${o.isUrgent ? 'text-rose-700' : 'text-slate-800'}`}>{o.customerName}</h4>
                   <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-full text-white ${o.company === Company.MAHFAZA ? 'bg-indigo-600' : 'bg-emerald-500'}`}>{o.company === Company.MAHFAZA ? 'محفظة' : 'بداعة'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5"><Phone size={12}/> {o.phoneNumber}</p>
                  <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5"><MapPin size={12} className="text-indigo-300"/> {o.area} {o.landmark && <span className="text-rose-400 font-black">• {o.landmark}</span>}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                 <span className={`px-2 py-0.5 rounded-full text-[7px] font-black border ${o.isUrgent ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{translateStatus(o.status)}</span>
                 <div className="flex gap-1.5">
                    {o.locationUrl && <a href={o.locationUrl} target="_blank" onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg"><Navigation size={14}/></a>}
                    <a href={`tel:${o.phoneNumber}`} onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg active:scale-90 transition-all"><Phone size={14}/></a>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {showArchive && (
        <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-4">
           <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">الأرشيف المنجز</h3>
           {archivedItems.map((o, idx) => (
             <div key={o.id} className="bg-white p-3 rounded-2xl flex justify-between items-center border border-slate-100 opacity-80 shadow-sm">
               <div className="flex items-center gap-2">
                 <div className={`w-1 h-6 rounded-full ${getStatusColor(o.status)}`} />
                 <div>
                   <p className="text-[10px] font-black text-slate-700">{o.customerName}</p>
                   <p className="text-[8px] font-bold text-slate-400">{o.area} • {o.createdAt}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">{translateStatus(o.status)}</span>
                 <button onClick={() => { setSelectedOrder(o); setCarpets(o.carpetCount); setReceipt(o.receiptNumber || ''); }} className="w-7 h-7 flex items-center justify-center text-indigo-500 bg-indigo-50 rounded-lg"><Edit3 size={12}/></button>
               </div>
             </div>
           ))}
        </div>
      )}
      
      <button onClick={() => setShowArchive(!showArchive)} className="w-full py-4 rounded-[1.8rem] border border-dashed border-slate-200 text-slate-300 font-black text-[9px] hover:border-indigo-300 hover:text-indigo-400 transition-all uppercase tracking-[0.2em]">
        {showArchive ? 'إغلاق الأرشيف' : `عرض المنجز (${archivedItems.length})`}
      </button>

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[90vh] border border-white">
            <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
               <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${selectedOrder.company === Company.MAHFAZA ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                    {selectedOrder.company === Company.MAHFAZA ? <Building2 size={24}/> : <Sparkles size={24}/>}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-800 leading-tight">{selectedOrder.customerName}</h3>
                    <p className="text-[10px] font-bold text-indigo-600 mt-0.5">{selectedOrder.phoneNumber} | {selectedOrder.area}</p>
                    {selectedOrder.landmark && <p className="text-[9px] font-black text-rose-500 mt-1 flex items-center gap-1"><MapPin size={10}/> {selectedOrder.landmark}</p>}
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => {
                    const newName = prompt("تعديل اسم الزبون:", selectedOrder.customerName) || selectedOrder.customerName;
                    const newPhone = prompt("تعديل الهاتف:", selectedOrder.phoneNumber) || selectedOrder.phoneNumber;
                    const newArea = prompt("تعديل المنطقة:", selectedOrder.area) || selectedOrder.area;
                    const newLandmark = prompt("تعديل النقطة الدالة:", selectedOrder.landmark || "") || selectedOrder.landmark;
                    onEditOrder({ id: selectedOrder.id, customerName: newName, phoneNumber: newPhone, area: newArea, landmark: newLandmark });
                    setSelectedOrder(prev => prev ? {...prev, customerName: newName, phoneNumber: newPhone, area: newArea, landmark: newLandmark} : null);
                  }} className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-all"><Edit3 size={18}/></button>
                  <button onClick={() => setSelectedOrder(null)} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={20}/></button>
               </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center border border-slate-100 shadow-inner">
                  <span className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">عدد السجاد</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCarpets(Math.max(0, carpets - 1))} className="w-9 h-9 bg-white rounded-xl shadow-sm text-rose-500 font-black border border-rose-50">-</button>
                    <input type="text" className="w-10 bg-transparent font-black text-center text-xl text-slate-800 outline-none" value={carpets} onChange={e => setCarpets(parseInt(toEngDigits(e.target.value)) || 0)} />
                    <button onClick={() => setCarpets(carpets + 1)} className="w-9 h-9 bg-white rounded-xl shadow-sm text-emerald-500 font-black border border-emerald-50">+</button>
                  </div>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 flex flex-col items-center shadow-inner">
                  <span className="text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-widest">رقم الوصل</span>
                  <input placeholder="0000" className="w-full bg-transparent font-black text-center text-2xl text-emerald-700 outline-none placeholder:text-emerald-200" value={receipt} onChange={e => setReceipt(toEngDigits(e.target.value))} />
                </div>
              </div>

              {selectedOrder.price && (
                <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100">
                  <span className="text-[10px] font-black text-indigo-600">السعر المتفق عليه</span>
                  <span className="text-sm font-black text-indigo-700">{selectedOrder.price} د.ع</span>
                </div>
              )}

              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MessageSquare size={12}/> ملاحظة الكابتن</div>
                    <button onClick={fetchManualLocation} className={`px-3 py-1.5 rounded-full text-[8px] font-black transition-all ${capturedLocation ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                      {isFetchingLocation ? <Loader2 size={10} className="animate-spin"/> : <MapPin size={10}/>}
                      {capturedLocation ? 'تم تسجيل الموقع' : 'تحديد الموقع'}
                    </button>
                 </div>
                 <textarea 
                  placeholder="ملاحظات حول حالة الطلب..." 
                  className="w-full bg-slate-50/50 p-4 rounded-2xl text-[10px] font-bold outline-none border border-slate-100 h-20 resize-none shadow-inner focus:bg-white"
                  value={driverNote}
                  onChange={e => setDriverNote(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleAction(OrderStatus.RECEIVED)} disabled={!receipt} className={`col-span-3 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${receipt ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}><CheckCircle size={20}/> تأكيد استلام الطلب</button>
                <ActionButton onClick={() => handleAction(OrderStatus.BUSY)} color="amber" icon={<Clock size={14}/>} label="مشغول" />
                <ActionButton onClick={() => handleAction(OrderStatus.NO_ANSWER)} color="purple" icon={<Ban size={14}/>} label="لا يرد" />
                <ActionButton onClick={() => handleAction(OrderStatus.POSTPONED)} color="slate" icon={<Clock size={14}/>} label="مؤجل" />
                <ActionButton onClick={() => handleAction(OrderStatus.REJECTED)} color="rose" icon={<X size={14}/>} label="رفض" />
                <ActionButton onClick={() => handleAction(OrderStatus.WRONG_NUMBER)} color="indigo" icon={<Navigation2 size={14}/>} label="رقم خطأ" />
                <button onClick={() => handleAction(OrderStatus.BLOCKED)} className="bg-slate-900 text-white p-2 rounded-xl font-black text-[9px] flex flex-col items-center gap-1.5 active:scale-90 transition-all shadow-md"><Ban size={14}/> حظر</button>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <h4 className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-1.5"><Clock size={14}/> سجل النشاط</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                   {selectedOrder.logs.slice().reverse().map((l, i) => (
                     <div key={i} className="flex justify-between items-center text-[9px] bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="font-black text-slate-700">{translateStatus(l.action as string)}</span>
                        <div className="text-left font-mono opacity-50 leading-tight text-[7px]">
                           <span className="block font-black">{l.timestamp}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onClick, color, icon, label }: any) => {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  };
  return (
    <button onClick={onClick} className={`${colors[color]} p-2 rounded-xl font-black text-[9px] border transition-all active:scale-90 flex flex-col items-center gap-1 shadow-sm`}>
      {icon} {label}
    </button>
  );
};

export default DriverDashboard;
