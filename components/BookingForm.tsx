import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { Service, Professional, Appointment, Client } from '../types';
import { storageService } from '../services/storageService';

interface BookingFormProps {
  onBack: () => void;
  preFilledClient?: Client; // Optional prop if client is logged in
}

const BookingForm: React.FC<BookingFormProps> = ({ onBack, preFilledClient }) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [clientName, setClientName] = useState(preFilledClient?.name || '');
  const [clientPhone, setClientPhone] = useState(preFilledClient?.phone || '');
  const [clientCpf, setClientCpf] = useState(preFilledClient?.cpf || '');

  useEffect(() => {
    setServices(storageService.getServices());
    setProfessionals(storageService.getProfessionals());
  }, []);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedPro || !selectedDate || !selectedTime || !clientName) return;

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      serviceId: selectedService.id,
      professionalId: selectedPro.id,
      date: selectedDate,
      time: selectedTime,
      clientName,
      clientPhone,
      clientCpf: preFilledClient ? preFilledClient.cpf : clientCpf, // Save CPF
      status: 'pending'
    };

    storageService.addAppointment(newAppointment);
    setStep(4); // Success screen
  };

  const getAvailableTimes = () => {
    // Mock logic for available times
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </button>
      
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Agende seu horário</h2>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-colors ${step >= i ? 'bg-barber-gold' : 'bg-zinc-800'}`} 
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Escolha o Serviço</h3>
              <div className="grid gap-4">
                {services.map(service => (
                  <div 
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep(2); }}
                    className="cursor-pointer bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-barber-gold hover:bg-zinc-700/50 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-white group-hover:text-barber-gold transition-colors">{service.name}</h4>
                      <span className="text-barber-gold font-bold">R$ {service.price}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{service.description}</p>
                    <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {service.duration} min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Escolha o Profissional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professionals.map(pro => (
                  <div 
                    key={pro.id}
                    onClick={() => { setSelectedPro(pro); setStep(3); }}
                    className="cursor-pointer bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-barber-gold hover:bg-zinc-700/50 transition-all text-center group"
                  >
                    <img 
                      src={pro.avatarUrl} 
                      alt={pro.name} 
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-zinc-700 group-hover:border-barber-gold transition-colors mb-4" 
                    />
                    <h4 className="text-lg font-bold text-white">{pro.name}</h4>
                    <p className="text-zinc-400 text-sm">{pro.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Data e Dados</h3>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-1">Data</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-1">Horário</label>
                    <select 
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {getAvailableTimes().map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  {/* Only show name/phone inputs if NOT pre-filled (i.e. not logged in) */}
                  {!preFilledClient && (
                    <>
                      <div className="mb-4">
                        <label className="block text-zinc-400 text-sm mb-1">Seu Nome</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-5 h-5 text-zinc-500" />
                          <input 
                              type="text" 
                              required
                              placeholder="João Silva"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                              value={clientName}
                              onChange={e => setClientName(e.target.value)}
                            />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-zinc-400 text-sm mb-1">Telefone (Whatsapp)</label>
                        <input 
                            type="tel" 
                            required
                            placeholder="(11) 99999-9999"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                          />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1">CPF (Opcional para histórico)</label>
                        <input 
                            type="text" 
                            placeholder="000.000.000-00"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-barber-gold"
                            value={clientCpf}
                            onChange={e => setClientCpf(e.target.value)}
                          />
                      </div>
                    </>
                  )}
                  
                  {preFilledClient && (
                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 mb-4">
                      <p className="text-sm text-zinc-400">Agendando como:</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-barber-gold" />
                        {preFilledClient.name} <span className="text-zinc-500 text-xs">({preFilledClient.type})</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950 p-4 rounded-lg mt-6">
                  <p className="text-zinc-400 text-sm">Resumo:</p>
                  <p className="text-white font-medium">{selectedService?.name} com {selectedPro?.name}</p>
                  <p className="text-barber-gold font-bold mt-1">Total: R$ {selectedService?.price}</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-barber-gold hover:bg-barber-goldhover text-black font-bold py-4 rounded-lg text-lg transition-all mt-6"
                >
                  Confirmar Agendamento
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Agendado com Sucesso!</h3>
              <p className="text-zinc-400 mb-8">Te esperamos na data marcada, {clientName}.</p>
              <button 
                onClick={onBack}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Voltar ao Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;