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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" 
          alt="Barbershop Background" 
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
      </div>

      {/* Admin Button (Gear) - Top Right */}
      <button 
        onClick={() => setIsAdminLoginOpen(true)}
        className="absolute top-6 right-6 z-20 text-zinc-400 hover:text-barber-gold p-2 transition-colors bg-black/30 rounded-full backdrop-blur-md border border-white/10"
        title="Área Administrativa"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Main Card */}
      <div className="relative z-10 bg-zinc-900/90 backdrop-blur-md max-w-md w-full p-8 rounded-2xl shadow-2xl text-center border border-white/10 animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 rounded-full border-4 border-barber-gold overflow-hidden bg-black flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            {isLoadingLogo ? (
              <Loader2 className="w-10 h-10 text-barber-gold animate-spin" />
            ) : logo ? (
              <img src={logo} alt="BarberPro Elite Logo" className="w-full h-full object-cover" />
            ) : (
              <Scissors className="w-12 h-12 text-barber-gold" />
            )}
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
          BarberPro <span className="text-barber-gold">Elite</span>
        </h1>

        <p className="text-zinc-300 mb-10 leading-relaxed font-light">
          Estilo clássico e gestão moderna.<br/>Agende seu horário com exclusividade.
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => setView('client-portal')}
            className="w-full py-4 rounded-xl bg-barber-gold hover:bg-barber-goldhover text-black font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-barber-gold/20 flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            Entrar no Sistema
          </button>

          <button 
            onClick={() => setView('booking')}
            className="w-full py-4 rounded-xl bg-zinc-800/50 border border-barber-gold/50 text-barber-gold hover:bg-barber-gold hover:text-black font-bold text-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Calendar className="w-5 h-5" />
            Agendar Horário
          </button>
        </div>

        <footer className="mt-10 text-xs text-zinc-500 font-medium border-t border-white/5 pt-4">
          © 2025 BarberPro Elite • Excelência em Estilo
        </footer>
      </div>

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-barber-gold rounded-t-2xl"></div>
            <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-barber-gold" /> Acesso Administrativo
            </h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Senha de Acesso</label>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold transition-colors placeholder-zinc-700"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
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