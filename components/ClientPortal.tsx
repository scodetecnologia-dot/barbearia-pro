import React, { useState, useEffect } from 'react';
import { 
  User, 
  ArrowLeft, 
  CreditCard, 
  Scissors, 
  Calendar, 
  Clock, 
  LogOut, 
  History,
  CheckCircle,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { Client, ClientType, Appointment } from '../types';
import { storageService } from '../services/storageService';
import BookingForm from './BookingForm';

interface ClientPortalProps {
  onBack: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'new-booking'>('login');
  const [currentUser, setCurrentUser] = useState<Client | null>(null);
  
  // Login State
  const [loginCpf, setLoginCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regType, setRegType] = useState<ClientType>('avulso');
  const [regCpfError, setRegCpfError] = useState('');

  // Dashboard Data
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Load appointments when entering dashboard
  useEffect(() => {
    if (view === 'dashboard' && currentUser) {
      const appts = storageService.getAppointmentsByCpf(currentUser.cpf);
      // Sort by date (newest first)
      appts.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
      setMyAppointments(appts);
    }
  }, [view, currentUser]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1'); // Limit length
  };

  const validateCPF = (cpf: string) => {
    // Basic format validation
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  };

  const handleLoginCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    const clean = formatted.replace(/\D/g, '');
    setLoginCpf(formatted);
    
    // Backdoor: Allow "123456789" or "12345678900" without error validation
    if (clean === '123456789' || clean === '12345678900') {
      setCpfError('');
      return;
    }

    if (formatted.length > 0 && !validateCPF(formatted)) {
       setCpfError('CPF deve conter 11 dígitos');
    } else {
       setCpfError('');
    }
  };

  const handleRegCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setRegCpf(formatted);
    
    if (formatted.length > 0 && !validateCPF(formatted)) {
       setRegCpfError('CPF deve conter 11 dígitos');
    } else {
       setRegCpfError('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Backdoor for testing
    const cleanInput = loginCpf.replace(/\D/g, '');
    if (cleanInput === '123456789' || cleanInput === '12345678900') {
      const testUser: Client = {
        id: 'test-user-id',
        name: 'Usuário de Teste',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        type: 'mensalista', // VIP status for testing
        joinedAt: new Date().toISOString()
      };
      setCurrentUser(testUser);
      setView('dashboard');
      return;
    }

    if (cpfError) return;
    
    const client = storageService.getClientByCpf(loginCpf);
    if (client) {
      setCurrentUser(client);
      setView('dashboard');
    } else {
      // Suggest registration
      if(confirm('CPF não encontrado. Deseja realizar o cadastro?')) {
         setRegCpf(loginCpf);
         setView('register');
         setRegCpfError('');
         setCpfError('');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regCpfError) return;

    const newClient: Client = {
      id: crypto.randomUUID(),
      name: regName,
      cpf: regCpf,
      phone: regPhone,
      type: regType,
      joinedAt: new Date().toISOString()
    };

    const success = storageService.addClient(newClient);
    if (success) {
      setCurrentUser(newClient);
      setView('dashboard');
    } else {
      alert('Erro: CPF já cadastrado.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginCpf('');
    setView('login');
  };

  const fillTestCpf = () => {
    setLoginCpf('123.456.789-00');
    setCpfError('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'cancelled': return 'text-red-500 bg-red-500/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-zinc-500';
    }
  };

  if (view === 'new-booking' && currentUser) {
    return <BookingForm onBack={() => setView('dashboard')} preFilledClient={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button onClick={onBack} className="text-zinc-400 hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Área do <span className="text-barber-gold">Cliente</span>
        </h1>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        
        {view === 'login' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-barber-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-barber-gold">
                 <User className="w-8 h-8" />
               </div>
               <h2 className="text-xl font-bold text-white">Bem-vindo de volta</h2>
               <p className="text-zinc-400 text-sm">Digite seu CPF para acessar</p>
             </div>
             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-zinc-400 text-sm mb-1">CPF</label>
                 <div className="relative">
                   <input 
                      type="text" 
                      placeholder="000.000.000-00"
                      required
                      maxLength={14}
                      className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors
                        ${cpfError ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-barber-gold'}
                      `}
                      value={loginCpf}
                      onChange={handleLoginCpfChange}
                    />
                    {cpfError && (
                      <div className="absolute right-3 top-3.5 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                 </div>
                 {cpfError && <p className="text-red-500 text-xs mt-1 ml-1">{cpfError}</p>}
               </div>
               <button type="submit" className="w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-3 rounded-lg transition-colors">
                 Entrar
               </button>
               
               <button 
                type="button" 
                onClick={fillTestCpf}
                className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-barber-gold transition-colors py-2 border border-dashed border-zinc-800 hover:border-barber-gold/50 rounded-lg"
               >
                 <FlaskConical className="w-3 h-3" /> Usar CPF de Teste
               </button>

               <div className="text-center pt-4 border-t border-zinc-800">
                 <p className="text-zinc-400 text-sm mb-2">Ainda não tem cadastro?</p>
                 <button 
                  type="button" 
                  onClick={() => setView('register')}
                  className="text-white hover:text-barber-gold font-medium transition-colors"
                >
                   Criar conta
                 </button>
               </div>
             </form>
          </div>
        )}

        {view === 'register' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="text-center mb-6">
               <h2 className="text-xl font-bold text-white">Criar Cadastro</h2>
               <p className="text-zinc-400 text-sm">Preencha seus dados e escolha seu plano</p>
             </div>
             <form onSubmit={handleRegister} className="space-y-4">
                <div>
                 <label className="block text-zinc-400 text-sm mb-1">Nome Completo</label>
                 <input 
                    type="text" 
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
               </div>
               <div>
                 <label className="block text-zinc-400 text-sm mb-1">CPF</label>
                 <div className="relative">
                   <input 
                      type="text" 
                      placeholder="000.000.000-00"
                      required
                      maxLength={14}
                      className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors
                        ${regCpfError ? 'border-red-500 focus:border-red-500' : 'border-zinc-700 focus:border-barber-gold'}
                      `}
                      value={regCpf}
                      onChange={handleRegCpfChange}
                    />
                    {regCpfError && (
                      <div className="absolute right-3 top-3.5 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                 </div>
                 {regCpfError && <p className="text-red-500 text-xs mt-1 ml-1">{regCpfError}</p>}
               </div>
               <div>
                 <label className="block text-zinc-400 text-sm mb-1">Telefone</label>
                 <input 
                    type="tel" 
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                  />
               </div>
               
               <div>
                 <label className="block text-zinc-400 text-sm mb-2">Escolha seu Plano</label>
                 <div className="space-y-3">
                   <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${regType === 'avulso' ? 'border-barber-gold bg-barber-gold/10' : 'border-zinc-700 bg-zinc-800'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" className="accent-barber-gold" checked={regType === 'avulso'} onChange={() => setRegType('avulso')} />
                        <div>
                          <p className="font-bold text-white">Corte Avulso</p>
                          <p className="text-xs text-zinc-400">Pague apenas quando vier.</p>
                        </div>
                      </div>
                   </label>
                   <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${regType === 'fidelidade' ? 'border-barber-gold bg-barber-gold/10' : 'border-zinc-700 bg-zinc-800'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" className="accent-barber-gold" checked={regType === 'fidelidade'} onChange={() => setRegType('fidelidade')} />
                        <div>
                          <p className="font-bold text-white">Cliente Fidelidade</p>
                          <p className="text-xs text-zinc-400">Acumule pontos e ganhe descontos.</p>
                        </div>
                        <CreditCard className="w-4 h-4 text-barber-gold ml-auto" />
                      </div>
                   </label>
                   <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${regType === 'mensalista' ? 'border-barber-gold bg-barber-gold/10' : 'border-zinc-700 bg-zinc-800'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" className="accent-barber-gold" checked={regType === 'mensalista'} onChange={() => setRegType('mensalista')} />
                        <div>
                          <p className="font-bold text-white">Sócio Mensalista</p>
                          <p className="text-xs text-zinc-400">Cortes ilimitados por valor fixo.</p>
                        </div>
                        <div className="ml-auto bg-barber-gold text-black text-[10px] font-bold px-2 py-1 rounded">VIP</div>
                      </div>
                   </label>
                 </div>
               </div>

               <button type="submit" className="w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-3 rounded-lg transition-colors mt-4">
                 Finalizar Cadastro
               </button>
               <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="w-full text-zinc-500 hover:text-white py-2 text-sm transition-colors"
                >
                  Voltar para Login
                </button>
             </form>
          </div>
        )}
      </div>
      
      {/* Dashboard View - Overrides the container width above */}
      {view === 'dashboard' && currentUser && (
        <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
             <div className="flex justify-between items-center mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-white">Olá, {currentUser.name}</h1>
                  <p className="text-zinc-400 text-sm">
                    Membro: <span className="text-barber-gold font-bold uppercase">{currentUser.type}</span>
                  </p>
               </div>
               <button onClick={handleLogout} className="text-zinc-500 hover:text-red-400 flex items-center gap-2">
                 <LogOut className="w-5 h-5" /> Sair
               </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Menu Actions */}
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Menu Rápido</h3>
                  <button 
                    onClick={() => setView('new-booking')}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-6 rounded-xl text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-barber-gold transition-colors">Agendamento</h4>
                      <p className="text-zinc-400 text-sm mt-1">Marque um novo horário</p>
                    </div>
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-barber-gold group-hover:text-black transition-all">
                      <Scissors className="w-6 h-6" />
                    </div>
                  </button>
                  
                  {/* Info Card based on Type */}
                  <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 p-6 rounded-xl">
                    <h4 className="text-white font-bold mb-2">Status da Assinatura</h4>
                    {currentUser.type === 'mensalista' ? (
                       <div className="flex items-center gap-2 text-green-400">
                         <CheckCircle className="w-5 h-5" />
                         <span>Ativo - Cortes Ilimitados</span>
                       </div>
                    ) : currentUser.type === 'fidelidade' ? (
                        <div>
                          <p className="text-zinc-300 text-sm">Pontos acumulados: <span className="text-barber-gold font-bold">120 pts</span></p>
                          <div className="w-full bg-zinc-700 h-2 rounded-full mt-2">
                            <div className="bg-barber-gold h-2 rounded-full w-[60%]"></div>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">Faltam 80 pts para corte grátis</p>
                        </div>
                    ) : (
                      <p className="text-zinc-400 text-sm">Torne-se Mensalista e economize!</p>
                    )}
                  </div>
               </div>

               {/* History */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <History className="w-5 h-5 text-barber-gold" /> Realizados / Agendados
                 </h3>
                 
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {myAppointments.length === 0 ? (
                     <p className="text-zinc-500 text-center py-8">Nenhum agendamento encontrado.</p>
                   ) : (
                     myAppointments.map(appt => (
                       <div key={appt.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                         <div>
                            <p className="text-white font-medium">{storageService.getServices().find(s => s.id === appt.serviceId)?.name}</p>
                            <p className="text-zinc-400 text-xs mt-1 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> {appt.date}
                              <Clock className="w-3 h-3" /> {appt.time}
                            </p>
                            <p className="text-zinc-500 text-xs mt-1">Prof: {storageService.getProfessionals().find(p => p.id === appt.professionalId)?.name}</p>
                         </div>
                         <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getStatusColor(appt.status)}`}>
                           {appt.status}
                         </span>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;