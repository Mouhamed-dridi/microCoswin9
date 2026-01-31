
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical – line stopped';
export type TicketStatus = 'Open' | 'In progress' | 'Closed';
export type ProblemType = 'Mechanical' | 'Electrical' | 'Hydraulic' | 'Software/PLC' | 'Sensor' | 'Other';
export type LocationType = 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Other';

export interface Ticket {
  id: number;
  date: string;
  startOperationDate?: string | null;
  endOperationDate?: string | null;
  closedTime?: string | null;
  machine: string;
  location: LocationType;
  type: ProblemType;
  urgency: UrgencyLevel;
  description: string;
  status: TicketStatus;
  reporter: string;
  operatorName: string;
  matricule: string;
  assignedTo?: string;
  maintenanceMatricule?: string;
  image?: string | null;
  resolution?: string;
}

export interface User {
  username: string;
  role: 'operator' | 'manager';
  groupIds?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
}

export interface AppPreferences {
  darkMode: boolean;
  language: 'en' | 'fr' | 'es' | 'de';
}
