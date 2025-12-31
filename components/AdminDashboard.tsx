import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar,
  DollarSign,
  Clock,
  Palette,
  Image as ImageIcon,
  Save,
  Loader2,
  PieChart,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Package,
  CreditCard,
  Filter,
  X,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent
} from 'lucide-react';
import { Service, Professional, Appointment, AdminTab, Product, Client, Expense } from '../types';
import { storageService } from '../services/storageService';
import { generateMarketingCopy, generateLogoImage } from '../services/geminiService';

interface AdminDashboardProps {
  onLogout: () => void;
}

const COLORS = ['#d4af37', '#a18323', '#7a6112', '#f3d97f', '#4a3b0b', '#8c701c'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Data States
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form States
  const [isGenerating, setIsGenerating] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({ name: '', price: 0, duration: 30, description: '' });
  const [newPro, setNewPro] = useState<Partial<Professional>>({ name: '', specialty: '', bio: '', avatarUrl: '' });
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', price: 0, stock: 0, description: '' });
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ description: '', amount: 0, category: 'outros', date: new Date().toISOString().split('T')[0] });
  
  // Branding State
  const [logoPrompt, setLogoPrompt] = useState('Logo minimalista e luxuoso para barbearia "BarberPro Elite", ícone de tesoura e navalha estilizados, cores dourado e preto, estilo vetorial, alta qualidade, fundo escuro.');
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'service' | 'professional' | 'appointment' | 'product' | 'expense' | null;
    id: string | null;
    name: string;
  }>({ isOpen: false, type: null, id: null, name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [s, p, a, prod, c, e, logo] = await Promise.all([
        storageService.getServices(),
        storageService.getProfessionals(),
        storageService.getAppointments(),
        storageService.getProducts(),
        storageService.getClients(),
        storageService.getExpenses(),
        storageService.getLogo()
      ]);

      setServices(s);
      setProfessionals(p);
      setAppointments(a);
      setProducts(prod);
      setClients(c);
      setExpenses(e);
      setCurrentLogo(logo);
      setIsLoadingAnalytics(false);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Analytics Logic
  const analytics = useMemo(() => {
    const revenueByMonth: Record<string, number> = {};
    const servicesCount: Record<string, number> = {};
    let totalRev = 0;

    // Calculate Revenue from Appointments
    appointments.forEach(appt => {
      if (appt.status === 'cancelled') return;

      const service = services.find(s => s.id === appt.serviceId);
      const price = service?.price || 0;
      const serviceName = service?.name || 'Desconhecido';

      const date = new Date(appt.date);
      if (!isNaN(date.getTime())) {
        const monthKey = date.toLocaleString('pt-BR', { month: 'short' });
        // Only count as confirmed revenue if completed or confirmed
        if (appt.status === 'completed' || appt.status === 'confirmed') {
           revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + price;
           totalRev += price;
        }
      }

      servicesCount[serviceName] = (servicesCount[serviceName] || 0) + 1;
    });

    const barData = Object.entries(revenueByMonth).map(([name, value]) => ({ name, value }));
    const maxRevenue = Math.max(...barData.map(d => d.value), 1);

    const totalServices = Object.values(servicesCount).reduce((a, b) => a + b, 0);
    const pieData = Object.entries(servicesCount).map(([name, value], index) => ({
      name,
      value,
      percentage: totalServices > 0 ? (value / totalServices) * 100 : 0,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    let currentDeg = 0;
    const gradientParts = pieData.map(item => {
      const start = currentDeg;
      const deg = (item.value / totalServices) * 360;
      currentDeg += deg;
      return `${item.color} ${start}deg ${currentDeg}deg`;
    });
    const conicGradient = gradientParts.length > 0 
      ? `conic-gradient(${gradientParts.join(', ')})` 
      : 'conic-gradient(#2d2d2d 0deg 360deg)';

    return { totalRevenue: totalRev, barData, maxRevenue, pieData, conicGradient, totalServices };
  }, [appointments, services]);

  // Financial Logic
  const financialSummary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = analytics.totalRevenue - totalExpenses;
    
    // Calculate expenses by category for Pie Chart
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(exp => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    const expensePieData = Object.entries(expensesByCategory).map(([name, value], index) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    // Conic Gradient for Expense Chart
    let currentDeg = 0;
    const gradientParts = expensePieData.map(item => {
      const start = currentDeg;
      const deg = (item.percentage / 100) * 360;
      currentDeg += deg;
      return `${item.color} ${start}deg ${currentDeg}deg`;
    });
    const expenseConicGradient = gradientParts.length > 0
      ? `conic-gradient(${gradientParts.join(', ')})`
      : 'conic-gradient(#2d2d2d 0deg 360deg)';

    return {
      totalExpenses,
      netProfit,
      expensePieData,
      expenseConicGradient
    };
  }, [expenses, analytics.totalRevenue]);

  // Filter Logic
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'all') return appointments;
    return appointments.filter(appt => appt.status === statusFilter);
  }, [appointments, statusFilter]);

  const handleGenerateDescription = async (type: 'service' | 'bio') => {
    if (!process.env.API_KEY) {
      alert("API Key não configurada para gerar textos com IA.");
      return;
    }

    const name = type === 'service' ? newService.name : newPro.name;
    const keywords = type === 'service' ? `Preço R$${newService.price}, Duração ${newService.duration}min` : newPro.specialty;

    if (!name) {
      alert("Por favor, preencha o nome antes de gerar a descrição.");
      return;
    }

    setIsGenerating(true);
    const text = await generateMarketingCopy(type, name, keywords || '');
    
    if (type === 'service') {
      setNewService(prev => ({ ...prev, description: text }));
    } else {
      setNewPro(prev => ({ ...prev, bio: text }));
    }
    setIsGenerating(false);
  };

  const handleGenerateLogo = async () => {
    if (!process.env.API_KEY) {
      alert("API Key não configurada para gerar imagens.");
      return;
    }
    if (!logoPrompt) return;

    setIsGenerating(true);
    const imageBase64 = await generateLogoImage(logoPrompt);
    
    if (imageBase64) {
      setGeneratedLogo(imageBase64);
    } else {
      alert("Não foi possível gerar a imagem. Tente novamente.");
    }
    setIsGenerating(false);
  };

  const handleSaveLogo = async () => {
    if (generatedLogo) {
      await storageService.saveLogo(generatedLogo);
      setCurrentLogo(generatedLogo);
      alert("Logo atualizado com sucesso!");
    }
  };

  const addService = async () => {
    if (!newService.name || !newService.price) return;
    const service: Service = {
      id: crypto.randomUUID(),
      name: newService.name!,
      price: Number(newService.price),
      duration: Number(newService.duration),
      description: newService.description || '',
    };
    const updated = [...services, service];
    setServices(updated);
    await storageService.saveServices(updated);
    setNewService({ name: '', price: 0, duration: 30, description: '' });
  };

  const removeService = async (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    await storageService.saveServices(updated);
  };

  const addProfessional = async () => {
    if (!newPro.name || !newPro.specialty) return;
    const pro: Professional = {
      id: crypto.randomUUID(),
      name: newPro.name!,
      specialty: newPro.specialty!,
      bio: newPro.bio || '',
      avatarUrl: newPro.avatarUrl || `https://picsum.photos/200/200?random=${Date.now()}`,
    };
    const updated = [...professionals, pro];
    setProfessionals(updated);
    await storageService.saveProfessionals(updated);
    setNewPro({ name: '', specialty: '', bio: '', avatarUrl: '' });
  };

  const removeProfessional = async (id: string) => {
    const updated = professionals.filter(p => p.id !== id);
    setProfessionals(updated);
    await storageService.saveProfessionals(updated);
  };

  const removeAppointment = async (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    await storageService.saveAppointments(updated);
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name!,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      description: newProduct.description || '',
      imageUrl: `https://picsum.photos/200/200?random=${Date.now() + 100}`,
    };
    const updated = [...products, product];
    setProducts(updated);
    await storageService.saveProducts(updated);
    setNewProduct({ name: '', price: 0, stock: 0, description: '' });
  };

  const removeProduct = async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    await storageService.saveProducts(updated);
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      description: newExpense.description!,
      amount: Number(newExpense.amount),
      category: newExpense.category as any,
      date: newExpense.date!,
    };
    const updated = [...expenses, expense];
    setExpenses(updated);
    await storageService.saveExpenses(updated);
    setNewExpense({ description: '', amount: 0, category: 'outros', date: new Date().toISOString().split('T')[0] });
  };

  const removeExpense = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await storageService.saveExpenses(updated);
  };

  // Confirmation Modal Handlers
  const handleDeleteClick = (type: 'service' | 'professional' | 'appointment' | 'product' | 'expense', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name });
  };

  const confirmDelete = async () => {
    if (deleteModal.type === 'service' && deleteModal.id) {
      await removeService(deleteModal.id);
    } else if (deleteModal.type === 'professional' && deleteModal.id) {
      await removeProfessional(deleteModal.id);
    } else if (deleteModal.type === 'appointment' && deleteModal.id) {
      await removeAppointment(deleteModal.id);
    } else if (deleteModal.type === 'product' && deleteModal.id) {
      await removeProduct(deleteModal.id);
    } else if (deleteModal.type === 'expense' && deleteModal.id) {
      await removeExpense(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  };

  const closeModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  };

  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Desconhecido';
  const getProName = (id: string) => professionals.find(p => p.id === id)?.name || 'Desconhecido';

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-barber-gold animate-spin" />
          <p className="text-zinc-400">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-barber-gold mb-8 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" /> Admin
        </h2>
        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Calendar className="w-5 h-5" /> Agendamentos
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'financial' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Wallet className="w-5 h-5" /> Financeiro
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Scissors className="w-5 h-5" /> Serviços
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'professionals' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Users className="w-5 h-5" /> Profissionais
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Package className="w-5 h-5" /> Produtos
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <CreditCard className="w-5 h-5" /> Clientes
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'branding' ? 'bg-zinc-800 text-barber-gold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
          >
            <Palette className="w-5 h-5" /> Identidade Visual
          </button>
        </nav>
        <button onClick={onLogout} className="mt-auto text-zinc-500 hover:text-red-400 text-sm">
          Sair do Sistema
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto relative">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Dashboard Geral</h1>
              {currentLogo && (
                <img src={currentLogo} alt="Logo Atual" className="w-12 h-12 rounded-full border border-barber-gold" />
              )}
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 text-sm">Agendamentos</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{appointments.length}</h3>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 text-sm">Receita Total</p>
                    <h3 className="text-2xl font-bold text-white mt-1">R$ {analytics.totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-zinc-400 text-sm">Clientes Cadastrados</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{clients.length}</h3>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart - Revenue */}
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 min-h-[300px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-barber-gold" />
                  Receita Mensal Estimada
                </h3>
                {isLoadingAnalytics ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-barber-gold animate-spin" />
                      <span className="text-zinc-500 text-xs animate-pulse">Calculando receita...</span>
                    </div>
                  </div>
                ) : analytics.barData.length > 0 ? (
                  <div className="h-64 flex items-end justify-between gap-2 mt-auto">
                    {analytics.barData.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                         <div className="text-xs text-barber-gold mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold">R${item.value}</div>
                         <div 
                          className="w-full max-w-[40px] bg-zinc-600 hover:bg-barber-gold transition-all duration-500 rounded-t-sm"
                          style={{ height: `${(item.value / analytics.maxRevenue) * 100}%` }}
                         ></div>
                         <div className="text-xs text-zinc-400 mt-2 capitalize">{item.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Sem dados suficientes
                  </div>
                )}
              </div>

              {/* Pie Chart - Service Distribution */}
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 min-h-[300px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-barber-gold" />
                  Serviços Mais Agendados
                </h3>
                {isLoadingAnalytics ? (
                  <div className="flex-1 flex items-center justify-center">
                     <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-barber-gold animate-spin" />
                      <span className="text-zinc-500 text-xs animate-pulse">Analisando serviços...</span>
                    </div>
                  </div>
                ) : analytics.totalServices > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-8 mt-auto mb-auto">
                    {/* The Chart */}
                    <div className="relative w-48 h-48 rounded-full flex-shrink-0" style={{ background: analytics.conicGradient }}>
                       <div className="absolute inset-2 bg-zinc-800 rounded-full flex items-center justify-center flex-col">
                          <span className="text-2xl font-bold text-white">{analytics.totalServices}</span>
                          <span className="text-xs text-zinc-500">Agendamentos</span>
                       </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 space-y-2 w-full">
                      {analytics.pieData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="text-zinc-300">{item.name}</span>
                           </div>
                           <span className="font-mono text-zinc-400">{Math.round(item.percentage)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500">
                    Sem dados suficientes
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Próximos Agendamentos</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-500" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-barber-gold focus:border-barber-gold block p-2"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-950 uppercase font-medium border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Serviço</th>
                      <th className="px-6 py-3">Profissional</th>
                      <th className="px-6 py-3">Data/Hora</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                          Nenhum agendamento encontrado com este status.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-zinc-800/50">
                          <td className="px-6 py-4 font-medium text-white">{appt.clientName}</td>
                          <td className="px-6 py-4">{getServiceName(appt.serviceId)}</td>
                          <td className="px-6 py-4">{getProName(appt.professionalId)}</td>
                          <td className="px-6 py-4">{appt.date} às {appt.time}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                              ${appt.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                appt.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 
                                'bg-blue-500/10 text-blue-500'}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteClick('appointment', appt.id, `Agendamento de ${appt.clientName}`)}
                              className="text-red-500 hover:text-red-400 p-2 hover:bg-zinc-800 rounded transition-colors"
                              title="Excluir Agendamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Financeiro & Despesas</h1>
            
            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <p className="text-zinc-400 text-sm">Receita (Agendamentos)</p>
                    <h3 className="text-2xl font-bold text-green-500 mt-1">+ R$ {analytics.totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                    <ArrowUpCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <p className="text-zinc-400 text-sm">Despesas Totais</p>
                    <h3 className="text-2xl font-bold text-red-500 mt-1">- R$ {financialSummary.totalExpenses.toFixed(2)}</h3>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                    <ArrowDownCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-barber-gold/5 to-transparent"></div>
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <p className="text-zinc-400 text-sm">Lucro Líquido</p>
                    <h3 className={`text-3xl font-bold mt-1 ${financialSummary.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                      R$ {financialSummary.netProfit.toFixed(2)}
                    </h3>
                  </div>
                  <div className="p-2 bg-barber-gold/20 rounded-lg text-barber-gold">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Distribution Chart */}
            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 min-h-[300px] mb-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-barber-gold" />
                Distribuição de Despesas
              </h3>
              {financialSummary.totalExpenses > 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
                  {/* The Chart */}
                  <div className="relative w-56 h-56 rounded-full flex-shrink-0 shadow-xl" style={{ background: financialSummary.expenseConicGradient }}>
                      <div className="absolute inset-2 bg-zinc-800 rounded-full flex items-center justify-center flex-col">
                        <span className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Total Gasto</span>
                        <span className="text-2xl font-bold text-red-400">R$ {financialSummary.totalExpenses.toFixed(2)}</span>
                      </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="w-full max-w-xs space-y-3">
                    {financialSummary.expensePieData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-zinc-900/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                            <span className="text-zinc-200 capitalize">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400 font-mono">R$ {item.value.toFixed(2)}</span>
                            <span className="bg-zinc-900 text-xs px-2 py-0.5 rounded text-zinc-500 font-medium w-12 text-right">{Math.round(item.percentage)}%</span>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                  <Percent className="w-8 h-8 opacity-20" />
                  <p>Sem despesas registradas para exibir o gráfico.</p>
                </div>
              )}
            </div>

            {/* Expenses Form */}
            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nova Despesa</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-zinc-400 text-xs mb-1">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Conta de Luz"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-zinc-400 text-xs mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-zinc-400 text-xs mb-1">Categoria</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  >
                    <option value="aluguel">Aluguel</option>
                    <option value="contas">Contas (Luz/Água)</option>
                    <option value="produtos">Produtos/Estoque</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="marketing">Marketing</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                   <button
                    onClick={addExpense}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Adicionar Gasto
                  </button>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Histórico de Despesas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-zinc-950 uppercase font-medium border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-3">Descrição</th>
                      <th className="px-6 py-3">Categoria</th>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Valor</th>
                      <th className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                          Nenhuma despesa registrada.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp, index) => (
                        <tr key={exp.id} className="hover:bg-zinc-800/50 animate-in fade-in slide-in-from-bottom-5 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                          <td className="px-6 py-4 font-medium text-white">{exp.description}</td>
                          <td className="px-6 py-4 capitalize">{exp.category}</td>
                          <td className="px-6 py-4">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-red-400 font-mono">- R$ {exp.amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteClick('expense', exp.id, exp.description)}
                              className="text-zinc-500 hover:text-red-500 p-2 hover:bg-zinc-800 rounded transition-colors"
                              title="Excluir Despesa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Gerenciar Serviços</h1>
            
            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Novo Serviço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Serviço"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-zinc-500">R$</span>
                    <input
                      type="number"
                      placeholder="Preço"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                      value={newService.price || ''}
                      onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      placeholder="Minutos"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                      value={newService.duration || ''}
                      onChange={e => setNewService({...newService, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Descrição do serviço..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold h-20"
                      value={newService.description}
                      onChange={e => setNewService({...newService, description: e.target.value})}
                    />
                    <button
                      onClick={() => handleGenerateDescription('service')}
                      disabled={isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {isGenerating ? 'Gerando...' : 'Gerar IA'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">Use a IA para criar descrições atraentes baseadas no nome e preço.</p>
                </div>
              </div>
              <button
                onClick={addService}
                className="mt-4 w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Serviço
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div 
                  key={service.id} 
                  className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex flex-col justify-between group relative animate-in fade-in slide-in-from-bottom-5 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white">{service.name}</h4>
                      <span className="text-barber-gold font-bold">R$ {service.price}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{service.description}</p>
                    <div className="flex items-center text-zinc-500 text-xs gap-1">
                      <Clock className="w-3 h-3" /> {service.duration} minutos
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteClick('service', service.id, service.name)}
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-900 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'professionals' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Gerenciar Equipe</h1>

            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Novo Profissional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome Completo"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                  value={newPro.name}
                  onChange={e => setNewPro({...newPro, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Especialidade (ex: Barba, Cortes Modernos)"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                  value={newPro.specialty}
                  onChange={e => setNewPro({...newPro, specialty: e.target.value})}
                />
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="URL da Foto (opcional)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                    value={newPro.avatarUrl || ''}
                    onChange={e => setNewPro({...newPro, avatarUrl: e.target.value})}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Deixe em branco para gerar uma imagem aleatória.</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Biografia..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold h-20"
                      value={newPro.bio}
                      onChange={e => setNewPro({...newPro, bio: e.target.value})}
                    />
                    <button
                      onClick={() => handleGenerateDescription('bio')}
                      disabled={isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {isGenerating ? 'Gerando...' : 'Gerar IA'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">Utilize a IA para criar uma biografia profissional baseada no nome e especialidade.</p>
                </div>
              </div>
              <button
                onClick={addProfessional}
                className="mt-4 w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Profissional
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((pro, index) => (
                <div 
                  key={pro.id} 
                  className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex items-start gap-4 group relative animate-in fade-in slide-in-from-bottom-5 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img src={pro.avatarUrl} alt={pro.name} className="w-16 h-16 rounded-full object-cover border-2 border-barber-gold" />
                  <div>
                    <h4 className="text-lg font-bold text-white">{pro.name}</h4>
                    <p className="text-barber-gold text-xs uppercase tracking-wider mb-2">{pro.specialty}</p>
                    <p className="text-zinc-400 text-sm">{pro.bio}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteClick('professional', pro.id, pro.name)}
                    className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-900 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Produtos para Venda</h1>

            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Novo Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome do Produto"
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-zinc-500">R$</span>
                    <input
                      type="number"
                      placeholder="Preço"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                      value={newProduct.price || ''}
                      onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      placeholder="Qtd. Estoque"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold"
                      value={newProduct.stock || ''}
                      onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Descrição do produto..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-barber-gold h-20"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
              </div>
              <button
                onClick={addProduct}
                className="mt-4 w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Produto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex flex-col group relative animate-in fade-in slide-in-from-bottom-5 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-40 bg-zinc-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{product.name}</h4>
                  <p className="text-barber-gold font-bold">R$ {product.price}</p>
                  <p className="text-xs text-zinc-400 mt-1">Estoque: {product.stock} un</p>
                  
                  <button 
                    onClick={() => handleDeleteClick('product', product.id, product.name)}
                    className="absolute top-2 right-2 text-red-500 bg-zinc-900/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {products.length === 0 && <p className="text-zinc-500 col-span-full text-center py-8">Nenhum produto cadastrado.</p>}
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Identidade Visual (Logo IA)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 h-fit">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-barber-gold" />
                  Gerador de Logo
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Prompt da Imagem</label>
                    <textarea 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold h-32 text-sm"
                      value={logoPrompt}
                      onChange={(e) => setLogoPrompt(e.target.value)}
                    />
                    <p className="text-xs text-zinc-500 mt-2">Descreva como você quer que o logo seja. Seja específico sobre cores e estilo.</p>
                  </div>

                  <button 
                    onClick={handleGenerateLogo}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Gerando Imagem...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" /> Gerar Logo
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Pré-visualização</h3>
                
                <div className="w-64 h-64 bg-zinc-900 rounded-full border-4 border-barber-gold flex items-center justify-center overflow-hidden mb-6 relative group">
                  {generatedLogo ? (
                    <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-cover" />
                  ) : currentLogo ? (
                    <img src={currentLogo} alt="Current Logo" className="w-full h-full object-cover" />
                  ) : (
                     <Scissors className="w-20 h-20 text-zinc-600" />
                  )}
                </div>

                {generatedLogo && (
                  <div className="w-full space-y-3">
                    <p className="text-center text-sm text-zinc-400">Nova imagem gerada (Não salva)</p>
                    <button 
                      onClick={handleSaveLogo}
                      className="w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> Salvar e Aplicar Logo
                    </button>
                    <button 
                       onClick={() => setGeneratedLogo(null)}
                       className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm transition-colors"
                    >
                      Descartar
                    </button>
                  </div>
                )}
                
                {!generatedLogo && currentLogo && (
                   <p className="text-green-500 text-sm mt-4 flex items-center gap-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     Logo personalizado ativo
                   </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-sm shadow-2xl transform transition-all scale-100">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
                <p className="text-zinc-400 text-sm">
                  Tem certeza que deseja remover <strong>{deleteModal.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={closeModal}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;