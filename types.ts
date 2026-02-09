
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical – line stopped';
export type TicketStatus = 'Open' | 'In Progress' | 'Closed' | 'Archivé';
export type ProblemType = 'Mechanical' | 'Electrical' | 'Hydraulic' | 'Software/PLC' | 'Sensor' | 'Other';
export type LocationType = 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Other';

export interface Comment {
  date: string;
  text: string;
}

export interface Ticket {
  ticketId: string;
  createdDate: string;
  user: string; // Operator Name
  userId: string; // Matricule
  machine: string;
  location: LocationType;
  proties: UrgencyLevel;
  problemeKind: ProblemType;
  problemeDiscartion: string;
  status: TicketStatus;
  assignedTo: string;
  comments: Comment[];
  attachments: any[];
}

export interface User {
  username: string;
  role: 'operator' | 'manager' | 'maintenance';
}

export type UserRole = 'Operator' | 'Manager' | 'Maintenance';
export type UserStatus = 'Actif' | 'Inactif';

export interface AppUser {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  group: string;
  status: UserStatus;
}

export interface Group {
  id: string;
  name: string;
}
