export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  themeIds?: string[]; // Added theme IDs array
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
  budget: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  clientId: string;
  projectId?: string;
  date: Date;
  duration: number;
  meetingUrl?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ComponentSample {
  id: string;
  name: string;
  category: 'navigation' | 'forms' | 'cards' | 'buttons' | 'modals';
  preview: string;
  code: string;
  selected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}