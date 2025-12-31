import { Service, Professional, Appointment, Client, Product, Expense } from '../types';

/**
 * DATABASE ABSTRACTION LAYER
 * ------------------------------------------------------------------
 * Atualmente, este serviço usa 'localStorage' para persistência no navegador.
 * Para preparar o sistema para hospedagem e banco de dados real (SQL/NoSQL):
 * 
 * 1. Mantenha os nomes das funções (ex: getServices, saveServices).
 * 2. Substitua o conteúdo interno de localStorage por chamadas de API (fetch/axios).
 *    Exemplo: 
 *    getServices: async () => { const res = await fetch('/api/services'); return res.json(); }
 * 
 * Isso garante que o frontend (React) funcione independente do backend escolhido.
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
  getServices: (): Service[] => {
    const data = localStorage.getItem(KEYS.SERVICES);
    return data ? JSON.parse(data) : DEFAULT_SERVICES;
  },
  saveServices: (services: Service[]) => {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },

  // Professionals
  getProfessionals: (): Professional[] => {
    const data = localStorage.getItem(KEYS.PROFESSIONALS);
    return data ? JSON.parse(data) : DEFAULT_PROFESSIONALS;
  },
  saveProfessionals: (pros: Professional[]) => {
    localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(pros));
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : [];
  },
  saveAppointments: (appointments: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  },
  addAppointment: (appt: Appointment) => {
    const current = storageService.getAppointments();
    storageService.saveAppointments([...current, appt]);
  },
  getAppointmentsByCpf: (cpf: string): Appointment[] => {
    const all = storageService.getAppointments();
    return all.filter(appt => appt.clientCpf === cpf);
  },

  // Logo
  getLogo: (): string | null => {
    return localStorage.getItem(KEYS.LOGO);
  },
  saveLogo: (base64Image: string) => {
    localStorage.setItem(KEYS.LOGO, base64Image);
  },

  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  },
  addClient: (client: Client) => {
    const current = storageService.getClients();
    // Simple dedupe check by CPF
    if (current.some(c => c.cpf === client.cpf)) return false;
    storageService.saveClients([...current, client]);
    return true;
  },
  getClientByCpf: (cpf: string): Client | undefined => {
    const clients = storageService.getClients();
    return clients.find(c => c.cpf === cpf);
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Expenses (Financial)
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },
  addExpense: (expense: Expense) => {
    const current = storageService.getExpenses();
    storageService.saveExpenses([...current, expense]);
  }
};