import React, { useState, useEffect } from 'react';
import { Calendar, Scissors, Lock, User, Settings, Loader2 } from 'lucide-react';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import ClientPortal from './components/ClientPortal';
import { ViewState } from './types';
import { storageService } from './services/storageService';

const App = () => {
  const [view, setView] = useState<ViewState>('home');
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);

  useEffect(() => {
    // Refresh logo asynchronously
    const fetchLogo = async () => {
      setIsLoadingLogo(true);
      const savedLogo = await storageService.getLogo();
      setLogo(savedLogo);
      setIsLoadingLogo(false);
    };

    if (view === 'home') {
      fetchLogo();
    }
  }, [view]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === 'admin123') { 
      setView('admin');
      setIsAdminLoginOpen(false);
      setAdminPass('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const renderHome = () => (
    <div className="min-h-screen bg-zinc-950 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      {/* Admin Button (Gear) - Top Right */}
      <button 
        onClick={() => setIsAdminLoginOpen(true)}
        className="absolute top-6 right-6 z-20 bg-black/50 hover:bg-barber-gold hover:text-black text-zinc-400 p-3 rounded-full transition-all backdrop-blur-md border border-zinc-700 group"
        title="Área Administrativa"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="flex items-center justify-center w-32 h-32 rounded-full mb-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] overflow-hidden border-4 border-barber-gold bg-black">
          {isLoadingLogo ? (
            <Loader2 className="w-10 h-10 text-barber-gold animate-spin" />
          ) : logo ? (
            <img src={logo} alt="BarberPro Elite Logo" className="w-full h-full object-cover" />
          ) : (
            <Scissors className="w-16 h-16 text-barber-gold" />
          )}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
          BARBER<span className="text-barber-gold">PRO</span> ELITE
        </h1>
        <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mb-12">
          Estilo clássico para o homem moderno. Acesse a área do cliente para benefícios exclusivos.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
          <button 
            onClick={() => setView('client-portal')}
            className="flex-1 bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-barber-gold/20"
          >
            <User className="w-5 h-5" /> Área do Cliente
          </button>
          
          <button 
            onClick={() => setView('booking')}
            className="flex-1 bg-zinc-800/80 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl text-lg transition-all backdrop-blur-md border border-zinc-700 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" /> Agendar Avulso
          </button>
        </div>
      </div>

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesso Administrativo</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Senha de Acesso</label>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Digite: admin123"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Entrar
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdminLoginOpen(false)}
                className="w-full text-zinc-500 hover:text-white py-2 text-sm transition-colors"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="font-sans">
      {view === 'home' && renderHome()}
      {view === 'booking' && <BookingForm onBack={() => setView('home')} />}
      {view === 'client-portal' && <ClientPortal onBack={() => setView('home')} />}
      {view === 'admin' && <AdminDashboard onLogout={() => setView('home')} />}
    </div>
  );
};

export default App;