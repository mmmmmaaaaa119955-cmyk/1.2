
import { UserRole, Company, User, Order, OrderStatus } from './types';

// المندوبين
export const INITIAL_DELEGATES: User[] = [
  { id: 'd1', name: 'محمد', role: UserRole.DELEGATE, code: '1001', assignedCompanies: [Company.MAHFAZA, Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
  { id: 'd2', name: 'احمد', role: UserRole.DELEGATE, code: '1002', assignedCompanies: [Company.MAHFAZA], isOnline: false, lastSeen: '', isActive: true },
  { id: 'd3', name: 'عبدالله', role: UserRole.DELEGATE, code: '1003', assignedCompanies: [Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
  { id: 'd4', name: 'يحي', role: UserRole.DELEGATE, code: '1004', assignedCompanies: [Company.MAHFAZA], isOnline: false, lastSeen: '', isActive: true },
  { id: 'd5', name: 'ابراهيم', role: UserRole.DELEGATE, code: '1005', assignedCompanies: [Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
];

// السائقين
export const INITIAL_DRIVERS: User[] = [
  { id: 's1', name: 'ارشد', role: UserRole.DRIVER, code: '2001', assignedCompanies: [Company.MAHFAZA, Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
  { id: 's2', name: 'حمزة', role: UserRole.DRIVER, code: '2002', assignedCompanies: [Company.MAHFAZA], isOnline: false, lastSeen: '', isActive: true },
  { id: 's3', name: 'ياسر', role: UserRole.DRIVER, code: '2003', assignedCompanies: [Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
  { id: 's4', name: 'محمد برهان', role: UserRole.DRIVER, code: '2004', assignedCompanies: [Company.MAHFAZA, Company.BADA_A], isOnline: false, lastSeen: '', isActive: true },
  { id: 's5', name: 'بشار', role: UserRole.DRIVER, code: '2005', assignedCompanies: [Company.MAHFAZA], isOnline: false, lastSeen: '', isActive: true },
];

export const MANAGER_USER: User = {
  id: 'm1',
  name: 'المدير العام',
  role: UserRole.MANAGER,
  code: '1995',
  assignedCompanies: [Company.MAHFAZA, Company.BADA_A],
  isOnline: false,
  lastSeen: '',
  isActive: true
};

export const INITIAL_USERS: User[] = [
  MANAGER_USER,
  ...INITIAL_DELEGATES,
  ...INITIAL_DRIVERS
];

const generateMockOrders = (): Order[] => {
  const mockOrders: Order[] = [];
  const areas = ['المنصور', 'الكرادة', 'الدورة', 'الشعب', 'البنوك', 'القاهرة', 'اليرموك', 'السيدية', 'بغداد الجديدة', 'الكاظمية'];
  const statuses = Object.values(OrderStatus);
  const companies = [Company.MAHFAZA, Company.BADA_A];

  for (let i = 1; i <= 50; i++) {
    const day = (i % 28) + 1;
    const dateStr = `10:30 ${day.toString().padStart(2, '0')}/05/2025`;
    const delegate = INITIAL_DELEGATES[i % INITIAL_DELEGATES.length];
    const status = statuses[i % statuses.length];
    const company = companies[i % 2];
    
    const finalCompany = delegate.assignedCompanies.includes(company) ? company : delegate.assignedCompanies[0];
    
    let driverData = {};
    if (status === OrderStatus.RECEIVED || status === OrderStatus.REJECTED || i % 3 === 0) {
      const driver = INITIAL_DRIVERS[i % INITIAL_DRIVERS.length];
      driverData = {
        driverId: driver.id,
        driverName: driver.name,
        receiptNumber: status === OrderStatus.RECEIVED ? `${1000 + i}` : undefined,
        locationUrl: `https://www.google.com/maps?q=33.31${i},44.36${i}`,
      };
    }

    // Fix: Added missing serviceType property
    mockOrders.push({
      id: `ORD-MOCK-${i}`,
      customerName: `زبون رقم ${i}`,
      phoneNumber: `0770${1000000 + i}`,
      area: areas[i % areas.length],
      howHeard: i % 2 === 0 ? 'فيسبوك' : 'تيك توك',
      carpetCount: (i % 5) + 1,
      createdAt: dateStr,
      updatedAt: dateStr,
      delegateId: delegate.id,
      delegateName: delegate.name,
      company: finalCompany,
      status: status,
      serviceType: 'CARPET',
      busyCount: status === OrderStatus.BUSY ? 2 : 0,
      noAnswerCount: status === OrderStatus.NO_ANSWER ? 1 : 0,
      blockedCount: status === OrderStatus.BLOCKED ? 1 : 0,
      postponedCount: status === OrderStatus.POSTPONED ? 1 : 0,
      wrongNumberCount: status === OrderStatus.WRONG_NUMBER ? 1 : 0,
      logs: [
        { timestamp: dateStr, action: 'CREATED' as any, user: delegate.name },
        ...(status !== OrderStatus.PENDING ? [{ timestamp: dateStr, action: status, user: (driverData as any).driverName || 'النظام' }] : [])
      ],
      ...driverData
    });
  }
  return mockOrders;
};

export const MOCK_ORDERS = generateMockOrders();
