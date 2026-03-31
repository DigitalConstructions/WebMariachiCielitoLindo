import { motion } from 'motion/react';
import { Play, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

export default function GalleryView({ setView }: { setView: (v: ViewState) => void, key?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl md:text-7xl mb-6 text-on-surface">Galería de <span className="text-primary italic">Momentos</span> Inolvidables</h1>
        <p className="text-on-surface-variant font-light text-base md:text-lg max-w-2xl mb-12">Explore nuestra colección visual de presentaciones excepcionales, donde la tradición del mariachi se encuentra con la elegancia contemporánea.</p>
        
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 custom-scrollbar">
          <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mr-2 shrink-0">Filtrar por:</span>
          <button className="border border-primary text-primary px-6 py-2 rounded-full text-sm font-medium shrink-0">Todas</button>
          <button className="border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors px-6 py-2 rounded-full text-sm font-medium shrink-0">Serenatas</button>
          <button className="border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors px-6 py-2 rounded-full text-sm font-medium shrink-0">Eventos Corporativos</button>
          <button className="border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors px-6 py-2 rounded-full text-sm font-medium shrink-0">Bodas</button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px] mb-24">
          <div className="md:col-span-8 row-span-2 relative group overflow-hidden rounded-3xl bg-surface-container">
            <img src="https://images.unsplash.com/photo-1533174000255-16134b28c8e5?q=80&w=2670&auto=format&fit=crop" alt="Mariachi" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all group-hover:scale-110">
                <Play size={32} className="ml-2" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 p-10">
              <span className="border border-primary text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Video Destacado</span>
              <h3 className="font-serif text-2xl md:text-4xl text-on-surface mb-2">Serenata de Gala: Bodas de Oro</h3>
              <p className="text-sm md:text-base text-on-surface-variant">Hacienda Santa Rosa, Ciudad de México</p>
            </div>
          </div>
          <div className="md:col-span-4 relative group overflow-hidden rounded-3xl bg-surface-container">
            <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2670&auto=format&fit=crop" alt="Trumpet" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
          </div>
          <div className="md:col-span-4 relative group overflow-hidden rounded-3xl bg-surface-container">
            <img src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2670&auto=format&fit=crop" alt="Microphone" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
          </div>
          <div className="md:col-span-5 relative group overflow-hidden rounded-3xl bg-surface-container">
            <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2664&auto=format&fit=crop" alt="Guitar" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all">
                <Play size={20} className="ml-1" />
              </button>
            </div>
          </div>
          <div className="md:col-span-7 relative group overflow-hidden rounded-3xl bg-surface-container p-10 flex flex-col justify-center">
            <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2669&auto=format&fit=crop" alt="Event" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface to-transparent"></div>
            <div className="relative z-10">
              <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">Exclusividad</span>
              <h3 className="font-serif text-xl md:text-3xl text-on-surface max-w-md">Ambientes diseñados para el deleite auditivo</h3>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-on-surface mb-2">Presentaciones en Video</h2>
              <p className="text-on-surface-variant font-light">Disfrute de nuestra calidad sonora y presencia escénica.</p>
            </div>
            <button className="text-primary flex items-center gap-2 font-label text-sm group">
              Ver canal de YouTube <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Popurrí Mexicano - Live Session", desc: "Grabado en Estudios Churubusco", time: "04:20", img: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?q=80&w=2670&auto=format&fit=crop" },
              { title: "Bésame Mucho (Arreglo Especial)", desc: "Presentación en Gala de Beneficencia", time: "03:45", img: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2670&auto=format&fit=crop" },
              { title: "La Malagueña - Solo de Falsete", desc: "Evento Privado en San Ángel", time: "05:12", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2670&auto=format&fit=crop" }
            ].map((vid, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-video bg-surface-container">
                  <img src={vid.img} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-3 right-3 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-on-surface">{vid.time}</div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-on-primary shadow-lg">
                      <Play size={24} className="ml-1" />
                    </div>
                  </div>
                </div>
                <h4 className="font-serif text-xl text-on-surface mb-1 group-hover:text-primary transition-colors">{vid.title}</h4>
                <p className="text-sm text-on-surface-variant">{vid.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-surface-container-low rounded-3xl p-16 text-center border border-outline-variant/10 ambient-shadow">
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface mb-4">¿Desea capturar estos momentos en su evento?</h2>
          <p className="text-on-surface-variant font-light text-base md:text-lg mb-10 max-w-2xl mx-auto">Solicite una cotización personalizada y permítanos ser la banda sonora de su historia.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setView('contact')} className="gold-gradient text-on-primary px-8 py-4 font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,203,70,0.3)] transition-all">Cotizar Evento</button>
            <button onClick={() => setView('repertoire')} className="border border-outline-variant text-on-surface px-8 py-4 font-bold rounded-full hover:bg-surface-container transition-colors">Ver Repertorio</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
