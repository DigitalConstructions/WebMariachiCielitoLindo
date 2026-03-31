import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronRight, PlayCircle, ArrowRight, Phone, Mail, MapPin, Music } from 'lucide-react';
import { ViewState } from '../types';

export const HomeView = ({ setView }: { setView: (v: ViewState) => void, key?: string }) => {
  return (
    <motion.section 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-surface/70 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-surface z-10"></div>
        <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2664&auto=format&fit=crop" alt="Mariachi cantando" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="relative z-20 text-center px-6 max-w-5xl mt-20">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="font-serif text-5xl md:text-7xl lg:text-8xl mb-6 text-primary tracking-tight leading-tight text-shadow-editorial">
          La Excelencia de la <br /> <span className="italic font-light text-on-surface">Música Mexicana</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="font-body text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-light tracking-wide">
          Elevamos sus celebraciones con interpretaciones magistrales y la elegancia que solo el mejor Mariachi puede ofrecer.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={() => setView('contact')} className="gold-gradient text-on-primary px-10 py-4 font-bold text-lg hover:shadow-[0_0_30px_rgba(255,203,70,0.3)] transition-all rounded-full flex items-center gap-2">
            Contratar Ahora <ChevronRight size={20} />
          </button>
          <button onClick={() => setView('gallery')} className="border border-outline-variant text-primary px-10 py-4 font-bold text-lg hover:bg-surface-container transition-all flex items-center gap-3 rounded-full">
            <PlayCircle size={24} /> Ver Presentaciones
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export const AboutView = ({ setView }: { setView: (v: ViewState) => void, key?: string }) => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-32 px-6 md:px-12 lg:px-24 bg-surface relative min-h-screen flex items-center">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
      <div className="relative group order-2 lg:order-1">
        <div className="absolute -inset-4 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700 rounded-3xl"></div>
        <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2500&auto=format&fit=crop" alt="Mariachi" className="relative z-10 w-full h-[700px] object-cover grayscale-[20%] contrast-125 rounded-3xl" referrerPolicy="no-referrer" />
        <div className="absolute bottom-10 -right-10 z-20 bg-surface-container-low p-8 border border-outline-variant/20 max-w-xs hidden md:block ambient-shadow rounded-2xl">
          <p className="font-serif text-2xl text-primary mb-2">15+ Años</p>
          <p className="text-sm text-on-surface-variant">De trayectoria en los escenarios más prestigiosos.</p>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <span className="text-primary font-bold tracking-[0.2em] text-sm mb-6 block uppercase">Tradición & Clase</span>
        <h2 className="font-serif text-4xl md:text-6xl mb-10 leading-tight text-on-surface">Nuestra Esencia</h2>
        <div className="space-y-8 text-on-surface-variant font-light text-lg leading-relaxed">
          <p>En Mariachi Cielito Lindo, no solo interpretamos canciones; curamos experiencias. Con años de trayectoria en los escenarios más prestigiosos, hemos redefinido el concepto de Mariachi para eventos de alta gama.</p>
          <p>Nuestra agrupación se distingue por una impecable presencia escénica, uniformes de gala auténticos y una calidad vocal que honra las raíces de nuestra tierra con un toque contemporáneo y editorial.</p>
        </div>
        <button onClick={() => setView('gallery')} className="mt-12 text-primary font-bold flex items-center gap-3 group border-b border-primary/30 pb-2 hover:border-primary transition-colors">
          Ver nuestra galería <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  </motion.section>
);

export const ContactView = () => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-32 px-6 md:px-12 lg:px-24 bg-surface-container-low relative overflow-hidden min-h-screen flex items-center">
    <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
      <Music size={800} className="text-primary absolute -right-40 -top-40" />
    </div>
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10 w-full">
      <div>
        <h2 className="font-serif text-5xl md:text-7xl mb-12 leading-tight text-on-surface">Agende una <br/><span className="text-primary italic">Experiencia</span></h2>
        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 border border-outline-variant/30 flex items-center justify-center text-primary flex-shrink-0 rounded-full"><Phone size={20} /></div>
            <div><p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-bold">WhatsApp & Llamadas</p><p className="text-xl font-medium text-on-surface">+52 55 1234 5678</p></div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 border border-outline-variant/30 flex items-center justify-center text-primary flex-shrink-0 rounded-full"><Mail size={20} /></div>
            <div><p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Correo Electrónico</p><p className="text-xl font-medium text-on-surface">contacto@mariachicielito.com</p></div>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 border border-outline-variant/30 flex items-center justify-center text-primary flex-shrink-0 rounded-full"><MapPin size={20} /></div>
            <div><p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2 font-bold">Ubicación</p><p className="text-xl font-medium text-on-surface">Ciudad de México, MX</p></div>
          </div>
        </div>
      </div>
      <div className="bg-surface p-10 md:p-14 border border-outline-variant/10 ambient-shadow rounded-3xl">
        <h3 className="font-serif text-3xl mb-8 text-on-surface">Cotizar Evento</h3>
        <form className="space-y-6">
          <div><input type="text" placeholder="Nombre Completo" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="tel" placeholder="Teléfono" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors" />
            <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface-variant focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <select className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface-variant focus:outline-none focus:border-primary transition-colors appearance-none">
              <option value="" disabled selected>Tipo de Evento</option>
              <option value="boda">Boda</option>
              <option value="serenata">Serenata</option>
              <option value="corporativo">Evento Corporativo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div><textarea placeholder="Detalles adicionales..." rows={3} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors resize-none"></textarea></div>
          <button type="button" className="w-full gold-gradient text-on-primary py-5 font-bold text-lg hover:shadow-[0_0_30px_rgba(255,203,70,0.3)] transition-all rounded-full mt-4">Enviar Solicitud</button>
        </form>
      </div>
    </div>
  </motion.section>
);
