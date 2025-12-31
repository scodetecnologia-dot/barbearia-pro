import { Service, Professional, Appointment, Client, Product, Expense } from '../types';

/**
 * DATABASE ABSTRACTION LAYER (Async Ready)
 * ------------------------------------------------------------------
 * Este serviço agora simula uma API assíncrona baseada em Promises.
 * Isso prepara o sistema para conectar com qualquer banco (Firebase, Supabase, Postgres).
 * 
 * Para migrar para um banco real:
 * 1. Mantenha as assinaturas das funções (ex: async getServices(): Promise<Service[]>).
 * 2. Substitua o conteúdo 'localStorage' por 'fetch' ou chamadas de SDK do banco.
 */

const KEYS = {
  SERVICES: 'barberpro_services',
  PROFESSIONALS: 'barberpro_professionals',
  APPOINTMENTS: 'barberpro_appointments',
  LOGO: 'barberpro_logo',
  CLIENTS: 'barberpro_clients',
  PRODUCTS: 'barberpro_products',
  EXPENSES: 'barberpro_expenses',
};

// Simula delay de rede (300ms) para parecer uma API real
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Clássico',
    price: 50,
    duration: 45,
    description: 'Um corte tradicional com tesoura e acabamento na navalha, incluindo lavagem e finalização.',
  },
  {
    id: '2',
    name: 'Barba Terapia',
    price: 40,
    duration: 30,
    description: 'Ritual completo com toalha quente, esfoliação, hidratação e modelagem da barba.',
  },
  {
    id: '3',
    name: 'Corte + Barba (Combo)',
    price: 80,
    duration: 75,
    description: 'A experiência completa para o homem moderno. Renovação total do visual.',
  },
];

const DEFAULT_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Carlos "Navalha" Silva',
    specialty: 'Cortes Clássicos',
    bio: 'Mais de 10 anos de experiência transformando visuais com precisão cirúrgica.',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
  },
  {
    id: '2',
    name: 'André Fade',
    specialty: 'Degradê e Freestyle',
    bio: 'Especialista em cortes modernos e desenhos artísticos no cabelo.',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
  },
];

export const storageService = {
  // Services
  getServices: async (): Promise<Service[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : DEFAULT_SERVICES;
  },
  saveServices: async (services: Service[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  // Professionals
  getProfessionals: async (): Promise<Professional[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.PROFESSIONALS);
    return data ? JSON.parse(data) : DEFAULT_PROFESSIONALS;
  },
  saveProfessionals: async (pros: Professional[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(pros));
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveAppointments: async (appointments: Appointment[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },
  addAppointment: async (appt: Appointment): Promise<void> => {
    const current = await storageService.getAppointments();
    await storageService.saveAppointments([...current, appt]);
  },
  getAppointmentsByCpf: async (cpf: string): Promise<Appointment[]> => {
    const all = await storageService.getAppointments();
    return all.filter(appt => appt.clientCpf === cpf);
  },

  // Logo
  getLogo: async (): Promise<string | null> => {
    await delay(100); // Logo loads faster
    return localStorage.getItem(KEYS.LOGO);
  },
  saveLogo: async (base64Image: string): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.LOGO, base64Image);
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients: async (clients: Client[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },
  addClient: async (client: Client): Promise<boolean> => {
    const current = await storageService.getClients();
    // Simple dedupe check by CPF
    if (current.some(c => c.cpf === client.cpf)) return false;
    await storageService.saveClients([...current, client]);
    return true;
  },
  getClientByCpf: async (cpf: string): Promise<Client | undefined> => {
    const clients = await storageService.getClients();
    return clients.find(c => c.cpf === cpf);
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: async (products: Product[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Expenses (Financial)
  getExpenses: async (): Promise<Expense[]> => {
    await delay();
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: async (expenses: Expense[]): Promise<void> => {
    await delay();
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },
  addExpense: async (expense: Expense): Promise<void> => {
    const current = await storageService.getExpenses();
    await storageService.saveExpenses([...current, expense]);
  }
};