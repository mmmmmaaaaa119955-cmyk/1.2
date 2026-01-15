
export enum UserRole {
  DELEGATE = 'DELEGATE',
  DRIVER = 'DRIVER',
  MANAGER = 'MANAGER'
}

export enum Company {
  MAHFAZA = 'MAHFAZA',
  BADA_A = 'BADA_A'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  REJECTED = 'REJECTED',
  BUSY = 'BUSY',
  BLOCKED = 'BLOCKED',
  NO_ANSWER = 'NO_ANSWER',
  WRONG_NUMBER = 'WRONG_NUMBER',
  POSTPONED = 'POSTPONED'
}

export type ServiceCategory = 'CARPET' | 'SOFA' | 'HOUSE' | 'CAR' | 'LAUNDRY';

export interface ActivityLog {
  timestamp: string; // HH:mm DD/MM/YYYY
  action: OrderStatus | 'CREATED' | 'EDITED' | 'LOCATION_ADDED' | 'DRIVER_ASSIGNED' | 'URGENT_MARK';
  user: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  area: string;
  landmark?: string;
  howHeard: string;
  referredBy?: string;
  carpetCount: number;
  price?: number | string;
  notes?: string;
  createdAt: string;
  delegateId: string;
  delegateName: string;
  driverId?: string;
  driverName?: string;
  company: Company;
  status: OrderStatus;
  serviceType: ServiceCategory;
  busyCount: number;
  noAnswerCount: number;
  blockedCount: number;
  postponedCount: number;
  wrongNumberCount: number;
  receiptNumber?: string;
  locationUrl?: string;
  updatedAt: string;
  logs: ActivityLog[];
  isUrgent?: boolean;
  urgentNote?: string;
  isSeparator?: boolean; 
  separatorText?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  code: string;
  assignedCompanies: Company[];
  isOnline: boolean;
  lastSeen: string;
  isActive: boolean;
  systemAlert?: string;
}
