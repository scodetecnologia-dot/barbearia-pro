export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientCpf?: string; // Added for client linking
  serviceId: string;
  professionalId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export type ClientType = 'avulso' | 'fidelidade' | 'mensalista';

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  type: ClientType;
  joinedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'aluguel' | 'contas' | 'produtos' | 'manutencao' | 'marketing' | 'outros';
  date: string;
}

export type ViewState = 'home' | 'booking' | 'admin' | 'client-portal';
export type AdminTab = 'dashboard' | 'services' | 'professionals' | 'branding' | 'products' | 'clients' | 'financial';