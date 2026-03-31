import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronDown, Lock, Plus, ArrowRight, ListMusic, Trash2, Phone, Music } from 'lucide-react';
import { ViewState } from '../types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Song {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  occasions: string[];
  link?: string;
  dots: number;
}

export default function RepertoireView({ setView }: { setView: (v: ViewState) => void, key?: string }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selected, setSelected] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSongs: Song[] = [];
      snapshot.forEach((doc) => {
        fetchedSongs.push({ id: doc.id, ...doc.data() } as Song);
      });
      setSongs(fetchedSongs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'songs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSong = (song: Song) => {
    if (selected.find(s => s.id === song.id)) {
      setSelected(selected.filter(s => s.id !== song.id));
    } else {
      setSelected([...selected, song]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-24 px-6 md:px-12 lg:px-24 min-h-screen bg-surface flex flex-col lg:flex-row gap-12">
      {/* Main Content */}
      <div className="flex-1 max-w-5xl">
        <h1 className="font-serif text-5xl md:text-7xl mb-6 text-primary leading-tight">Nuestro <br/>Repertorio</h1>
        <p className="text-on-surface-variant font-light text-lg max-w-2xl mb-12">Explore nuestra curada selección de piezas maestras. Añada sus favoritas a su lista personalizada para solicitar una cotización detallada.</p>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant">Cargando repertorio...</div>
          ) : songs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant">No hay canciones disponibles en este momento.</div>
          ) : songs.map(song => {
            const isSelected = selected.find(s => s.id === song.id);
            return (
              <div key={song.id} className={`bg-surface-container-low border ${isSelected ? 'border-primary' : 'border-outline-variant/10'} rounded-3xl p-6 relative group transition-colors`}>
                <Lock size={16} className="absolute top-6 right-6 text-on-surface-variant/50" />
                <div className="flex gap-2 mb-6">
                  {song.genres?.[0] && <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30 px-2 py-1 rounded-md">{song.genres[0]}</span>}
                  {song.occasions?.[0] && <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant/30 px-2 py-1 rounded-md">{song.occasions[0]}</span>}
                </div>
                <h4 className="font-serif text-2xl text-on-surface mb-1">{song.title}</h4>
                <p className="text-sm text-on-surface-variant italic mb-8">{song.artist}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < song.dots ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>
                    ))}
                  </div>
                  <button 
                    onClick={() => toggleSong(song)}
                    className={`text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${isSelected ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:border-primary hover:text-primary'}`}
                  >
                    {isSelected ? 'Añadido' : <><Plus size={16} /> Añadir</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">&lt;</button>
          <button className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">1</button>
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">2</button>
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">3</button>
          <span className="w-10 h-10 flex items-center justify-center text-on-surface-variant">...</span>
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">12</button>
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">&gt;</button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-32 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-6 ambient-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-xl text-primary flex items-center gap-2"><ListMusic size={20} /> Mi Selección</h3>
            <button onClick={() => setSelected([])} className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
              <Trash2 size={12} /> Limpiar
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mb-6">{selected.length} CANCIONES SELECCIONADAS</p>
          
          <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {selected.length === 0 ? (
              <p className="text-sm text-on-surface-variant/50 italic text-center py-8">No hay canciones seleccionadas</p>
            ) : (
              selected.map(song => (
                <div key={song.id} className="bg-surface-container p-3 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0">
                    <Music size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{song.title}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{song.artist}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => {
              if (selected.length === 0) return;
              const text = `Hola Mariachi Cielito Lindo, me gustaría cotizar un evento con las siguientes canciones:\n\n${selected.map(s => `- ${s.title} (${s.artist})`).join('\n')}`;
              window.open(`https://wa.me/525512345678?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="w-full gold-gradient text-on-primary py-4 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(255,203,70,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Phone size={18} /> WhatsApp
          </button>
          <p className="text-[10px] text-center text-on-surface-variant mt-4 leading-relaxed">
            Copiaremos tu selección al portapapeles y te redirigiremos a WhatsApp para tu cotización.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
