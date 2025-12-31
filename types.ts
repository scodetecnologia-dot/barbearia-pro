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

/**
 * Interface Standard for Database Providers.
 * Implement this interface to connect to Firebase, Supabase, MySQL, etc.
 */
export interface StorageProvider {
  getServices: () => Promise<Service[]>;
  saveServices: (services: Service[]) => Promise<void>;
  getProfessionals: () => Promise<Professional[]>;
  saveProfessionals: (pros: Professional[]) => Promise<void>;
  getAppointments: () => Promise<Appointment[]>;
  saveAppointments: (appointments: Appointment[]) => Promise<void>;
  addAppointment: (appt: Appointment) => Promise<void>;
  getAppointmentsByCpf: (cpf: string) => Promise<Appointment[]>;
  getLogo: () => Promise<string | null>;
  saveLogo: (base64Image: string) => Promise<void>;
  getClients: () => Promise<Client[]>;
  saveClients: (clients: Client[]) => Promise<void>;
  addClient: (client: Client) => Promise<boolean>;
  getClientByCpf: (cpf: string) => Promise<Client | undefined>;
  getProducts: () => Promise<Product[]>;
  saveProducts: (products: Product[]) => Promise<void>;
  getExpenses: () => Promise<Expense[]>;
  saveExpenses: (expenses: Expense[]) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
}